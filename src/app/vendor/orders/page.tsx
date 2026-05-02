'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, RefreshCw } from 'lucide-react';
import { StatusBadge }  from '@/components/ui/StatusBadge';
import { PageLoader }   from '@/components/ui/LoadingSpinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { useToast }     from '@/components/providers/ToastProvider';
import { formatCurrency, formatDate, generateOrderRef } from '@/lib/utils';
import type { Order }   from '@/types';

const NEXT_STATUS: Record<string, string | null> = {
  CONFIRMED:     'IN_PRODUCTION',
  IN_PRODUCTION: 'READY',
  READY:         'SHIPPED',
  SHIPPED:       'DELIVERED',
  DELIVERED:     null,
  CANCELLED:     null,
  PENDING:       'CONFIRMED',
  PAYMENT_PENDING: null,
};

const NEXT_LABEL: Record<string, string> = {
  CONFIRMED:     'Start Production',
  IN_PRODUCTION: 'Mark Ready',
  READY:         'Mark Shipped',
  SHIPPED:       'Mark Delivered',
};

export default function VendorOrdersPage() {
  const { toast } = useToast();
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/orders?pageSize=100');
    const d   = await res.json();
    setOrders(d.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function advance(orderId: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;

    setUpdating(orderId);
    const res  = await fetch(`/api/orders/${orderId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: next }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: data.data.status } : o));
      toast('success', 'Order updated');
    } else {
      toast('error', 'Update failed', data.error);
    }
    setUpdating(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders assigned yet" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-gray-900">{generateOrderRef(order.id)}</span>
                    <StatusBadge status={order.status} />
                    {order.isExpressDelivery && <span className="badge bg-gold-100 text-gold-700">⚡ Express</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Customer: {order.user?.name ?? '—'} · {order.items?.length ?? 0} item(s) · {formatDate(order.createdAt)}
                  </p>
                  {order.customerAddress && (
                    <p className="text-xs text-gray-500 mt-0.5">📍 {order.customerAddress}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-700">{formatCurrency(order.totalPrice)}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => advance(order.id, order.status)}
                      disabled={updating === order.id}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      {updating === order.id ? '…' : NEXT_LABEL[order.status] ?? 'Advance'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items summary */}
              {order.items?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.id} className="badge bg-gray-100 text-gray-600">
                      {item.product?.name ?? 'Item'} ×{item.quantity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
