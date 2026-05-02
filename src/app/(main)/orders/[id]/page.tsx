'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, MapPin, Clock, Truck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { StatusBadge }  from '@/components/ui/StatusBadge';
import { PageLoader }   from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatRelative, generateOrderRef } from '@/lib/utils';
import type { Order }   from '@/types';

const STATUS_STEPS = [
  { key: 'PENDING',       label: 'Order Placed' },
  { key: 'CONFIRMED',     label: 'Confirmed' },
  { key: 'IN_PRODUCTION', label: 'In Production' },
  { key: 'READY',         label: 'Ready to Ship' },
  { key: 'SHIPPED',       label: 'Shipped' },
  { key: 'DELIVERED',     label: 'Delivered' },
];

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function OrderDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Unauthorized') { router.push('/auth/signin'); return; }
        setOrder(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <PageLoader />;
  if (!order)  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">
      Order not found. <Link href="/orders" className="text-brand-600 hover:underline">Back to orders</Link>
    </div>
  );

  const stepIndex = getStepIndex(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-600" />
            Order {generateOrderRef(order.id)}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Placed {formatRelative(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} className="text-sm px-3 py-1" />
      </div>

      {/* ── Progress tracker ──────────────────────────────────────────────── */}
      {order.status !== 'CANCELLED' && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Progress</h2>
          <div className="relative">
            {/* Track line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-brand-500 transition-all"
              style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-col items-center gap-1">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 ${
                    i < stepIndex  ? 'border-brand-500 bg-brand-500 text-white' :
                    i === stepIndex ? 'border-brand-500 bg-white text-brand-500' :
                                      'border-gray-200 bg-white text-gray-300'
                  }`}>
                    {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-medium text-center hidden sm:block ${
                    i <= stepIndex ? 'text-brand-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* ── Items ──────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {item.product?.imageUrl ? (
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.product?.name ?? 'Product'}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  {item.customizations && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.customizations as Record<string, string>).slice(0, 4).map(([k, v]) =>
                        v ? <span key={k} className="badge bg-gray-100 text-gray-500">{v}</span> : null
                      )}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Pricing */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Order Total</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
              {order.isExpressDelivery && (
                <div className="flex justify-between text-gold-700">
                  <span>⚡ Express</span>
                  <span>Included</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-brand-700">{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-brand-600" /> Delivery
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              {order.vendor && (
                <p className="flex items-start gap-1.5">
                  <span className="text-gray-400 shrink-0">Vendor:</span>
                  {order.vendor.name}
                </p>
              )}
              {order.customerAddress && (
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                  {order.customerAddress}
                </p>
              )}
              {order.estimatedDelivery && (
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  Est. {formatDate(order.estimatedDelivery)}
                </p>
              )}
              {order.routingNotes && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded p-2 mt-2">
                  {order.routingNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
