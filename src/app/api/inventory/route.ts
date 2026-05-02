import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UpdateInventorySchema = z.object({
  vendorId:  z.string(),
  productId: z.string(),
  stock:     z.number().int().min(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId  = searchParams.get('vendorId');
    const productId = searchParams.get('productId');

    const inventory = await prisma.inventory.findMany({
      where: {
        ...(vendorId  ? { vendorId }  : {}),
        ...(productId ? { productId } : {}),
      },
      include: {
        vendor:  { select: { id: true, name: true } },
        product: { select: { id: true, name: true, category: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: inventory });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin  = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR';
    if (!isAdmin && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body   = await req.json();
    const parsed = UpdateInventorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { vendorId, productId, stock } = parsed.data;

    // Vendors can only update their own inventory
    if (isVendor) {
      const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
      if (!vendor || vendor.id !== vendorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const record = await prisma.inventory.upsert({
      where: { vendorId_productId: { vendorId, productId } },
      update: { stock },
      create: { vendorId, productId, stock },
      include: {
        vendor:  { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: record });
  } catch {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
