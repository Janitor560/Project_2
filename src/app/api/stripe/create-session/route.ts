import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';

const Schema = z.object({
  orderId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body   = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await createCheckoutSession({
      items: order.items.map((item) => ({
        name:        item.product.name,
        description: `Custom ${item.product.category.toLowerCase()}`,
        imageUrl:    item.product.imageUrl ?? undefined,
        quantity:    item.quantity,
        unitPrice:   item.unitPrice,
      })),
      orderId:       order.id,
      customerEmail: session.user.email,
      successUrl:    `${appUrl}/orders/${order.id}?success=true`,
      cancelUrl:     `${appUrl}/checkout?cancelled=true`,
      metadata:      { orderId: order.id, userId: session.user.id },
    });

    // Record session ID so webhook can match back
    await prisma.order.update({
      where: { id: order.id },
      data:  { stripeSessionId: checkoutSession.id, status: 'PAYMENT_PENDING' },
    });

    return NextResponse.json({ data: { url: checkoutSession.url } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
