import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UpdateVendorSchema = z.object({
  name:          z.string().min(2).optional(),
  email:         z.string().email().optional(),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  lat:           z.number().optional(),
  lng:           z.number().optional(),
  serviceRadius: z.number().positive().optional(),
  isActive:      z.boolean().optional(),
  capacity:      z.number().int().positive().optional(),
  serviceAreas:  z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        inventory: { include: { product: true } },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true } }, items: { include: { product: true } } },
        },
      },
    });

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ data: vendor });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin  = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR';

    if (!isAdmin && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Vendors can only update their own record
    if (isVendor) {
      const vendor = await prisma.vendor.findUnique({ where: { id: params.id } });
      if (!vendor || vendor.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body   = await req.json();
    const parsed = UpdateVendorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.vendor.update({
      where: { id: params.id },
      data:  parsed.data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Soft delete
    await prisma.vendor.update({
      where: { id: params.id },
      data:  { isActive: false },
    });

    return NextResponse.json({ message: 'Vendor deactivated' });
  } catch {
    return NextResponse.json({ error: 'Failed to deactivate vendor' }, { status: 500 });
  }
}
