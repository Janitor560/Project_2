import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UpdateOrderSchema = z.object({
  status:          z.enum(['PENDING','PAYMENT_PENDING','CONFIRMED','IN_PRODUCTION','READY','SHIPPED','DELIVERED','CANCELLED']).optional(),
  assignedVendorId: z.string().optional(),
  notes:           z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user:    { select: { id: true, name: true, email: true, address: true } },
        vendor:  true,
        items:   { include: { product: true } },
        designs: true,
        notifications: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const isOwner  = order.userId === session.user.id;
    const isAdmin  = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR';

    if (!isOwner && !isAdmin && !isVendor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: order });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body   = await req.json();
    const parsed = UpdateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const isAdmin  = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR';

    // Non-admin customers can only cancel their own pending orders
    if (!isAdmin && !isVendor) {
      if (existing.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (parsed.data.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Customers may only cancel orders' }, { status: 403 });
      }
    }

    const { assignedVendorId, estimatedDelivery, ...rest } = parsed.data;

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(isAdmin && assignedVendorId ? { assignedVendorId } : {}),
        ...(estimatedDelivery ? { estimatedDelivery: new Date(estimatedDelivery) } : {}),
      },
      include: {
        vendor: { select: { id: true, name: true } },
        items:  { include: { product: { select: { id: true, name: true } } } },
      },
    });

    // Notify customer of status change
    if (parsed.data.status) {
      await prisma.notification.create({
        data: {
          orderId: params.id,
          userId:  existing.userId,
          type:    'ORDER_UPDATE',
          title:   'Order Status Updated',
          message: `Your order status changed to: ${parsed.data.status.replace(/_/g, ' ')}`,
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
