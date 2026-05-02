import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { routeOrder } from '@/lib/routing-algorithm';

const RoutingSchema = z.object({
  customerLat:       z.number(),
  customerLng:       z.number(),
  items:             z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })),
  isExpressDelivery: z.boolean().optional().default(false),
});

// Preview routing decision before placing an order
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = RoutingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { customerLat, customerLng, items, isExpressDelivery } = parsed.data;

    const [vendors, inventoryRecords, todayOrders] = await Promise.all([
      prisma.vendor.findMany({ where: { isActive: true } }),
      prisma.inventory.findMany(),
      prisma.order.groupBy({
        by: ['assignedVendorId'],
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          assignedVendorId: { not: null },
        },
        _count: { id: true },
      }),
    ]);

    const loadMap: Record<string, number> = {};
    for (const row of todayOrders) {
      if (row.assignedVendorId) loadMap[row.assignedVendorId] = row._count.id;
    }

    const result = routeOrder({
      customerLat,
      customerLng,
      items,
      vendors: vendors.map((v) => ({ ...v, currentLoad: loadMap[v.id] ?? 0 })),
      inventory: inventoryRecords,
      isExpressDelivery,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'No vendors available to fulfil this order' },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: 'Routing failed' }, { status: 500 });
  }
}
