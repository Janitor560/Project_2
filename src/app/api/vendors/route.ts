import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CreateVendorSchema = z.object({
  name:          z.string().min(2),
  email:         z.string().email(),
  phone:         z.string().optional(),
  address:       z.string(),
  lat:           z.number(),
  lng:           z.number(),
  serviceRadius: z.number().positive(),
  capacity:      z.number().int().positive().default(100),
  serviceAreas:  z.array(z.string()).default([]),
  userId:        z.string(), // must map to an existing VENDOR-role user
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const vendors = await prisma.vendor.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        inventory: {
          include: { product: { select: { id: true, name: true, category: true } } },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: vendors });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body   = await req.json();
    const parsed = CreateVendorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const vendor = await prisma.vendor.create({
      data: parsed.data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ data: vendor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
