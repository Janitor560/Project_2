import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { routeOrder } from '@/lib/routing-algorithm';

const OrderItemSchema = z.object({
  productId:      z.string(),
  quantity:       z.number().int().positive(),
  unitPrice:      z.number().positive(),
  customizations: z.record(z.unknown()).optional(),
});

const CreateOrderSchema = z.object({
  items:             z.array(OrderItemSchema).min(1),
  customerAddress:   z.string().optional(),
  customerLat:       z.number().optional(),
  customerLng:       z.number().optional(),
  isExpressDelivery: z.boolean().optional().default(false),
  notes:             z.string().optional(),
  design: z.object({
    text:       z.string().optional(),
    font:       z.string().optional(),
    color:      z.string().optional(),
    fontSize:   z.number().optional(),
    imageUrl:   z.string().optional(),
    layoutData: z.record(z.unknown()).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { items, customerAddress, customerLat, customerLng, isExpressDelivery, notes, design } = parsed.data;

    // ── Smart routing ────────────────────────────────────────────────────
    let assignedVendorId: string | undefined;
    let estimatedDelivery: Date | undefined;
    let routingNotes: string | undefined;

    if (customerLat && customerLng) {
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
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        vendors: vendors.map((v) => ({ ...v, currentLoad: loadMap[v.id] ?? 0 })),
        inventory: inventoryRecords,
        isExpressDelivery,
      });

      if (result) {
        assignedVendorId = result.vendorId;
        routingNotes     = result.reason;
        estimatedDelivery = new Date(
          Date.now() + result.estimatedDeliveryDays * 24 * 60 * 60 * 1000
        );
      }
    }

    const totalPrice = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId:            session.user.id,
        assignedVendorId,
        status:            'PENDING',
        totalPrice,
        customerAddress,
        customerLat,
        customerLng,
        estimatedDelivery,
        isExpressDelivery,
        routingNotes,
        notes,
        items: {
          create: items.map((i) => ({
            productId:      i.productId,
            quantity:       i.quantity,
            unitPrice:      i.unitPrice,
            customizations: i.customizations,
          })),
        },
        ...(design
          ? { designs: { create: [{ ...design }] } }
          : {}),
      },
      include: {
        items:   { include: { product: true } },
        designs: true,
        vendor:  true,
      },
    });

    // In-app notification
    await prisma.notification.create({
      data: {
        orderId: order.id,
        userId:  session.user.id,
        type:    'ORDER_CREATED',
        title:   'Order Placed',
        message: `Your order has been placed and routed to ${order.vendor?.name ?? 'our fulfillment center'}.`,
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status     = searchParams.get('status');
    const vendorId   = searchParams.get('vendorId');
    const page       = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize   = parseInt(searchParams.get('pageSize') ?? '20', 10);

    const isAdmin  = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR';

    // Vendors only see their assigned orders
    let vendorFilter: string | undefined;
    if (isVendor) {
      const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
      vendorFilter = vendor?.id;
    }

    const where = {
      ...(isAdmin  ? {} : isVendor ? { assignedVendorId: vendorFilter } : { userId: session.user.id }),
      ...(status   ? { status: status as never }         : {}),
      ...(vendorId && isAdmin ? { assignedVendorId: vendorId } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user:    { select: { id: true, name: true, email: true } },
          vendor:  { select: { id: true, name: true } },
          items:   { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
          designs: true,
        },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ data: orders, total, page, pageSize });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
