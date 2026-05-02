'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter }  from 'next/navigation';
import { Package, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge }  from '@/components/ui/StatusBadge';
import { PageLoader }   from '@/components/ui/LoadingSpinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, generateOrderRef } from '@/lib/utils';
import type { Order }   from '@/types';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin?callbackUrl=/orders'); return; }
    if (status !== 'authenticated') return;

    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => { setOrders(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, router]);

  if (loading || status === 'loading') return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Package className="h-6 w-6 text-brand-600" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Place your first order to see it here."
          action={<Link href="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {generateOrderRef(order.id)}
                  </span>
                  <StatusBadge status={order.status} />
                  {order.isExpressDelivery && (
                    <span className="badge bg-gold-100 text-gold-700">⚡ Express</span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''} ·{' '}
                  {order.vendor?.name ?? 'Routing pending'}
                </p>

                {order.estimatedDelivery && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Est. delivery: {formatDate(order.estimatedDelivery)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                <span className="font-bold text-brand-700">{formatCurrency(order.totalPrice)}</span>
                <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
              </div>

              <ChevronRight className="hidden sm:block h-5 w-5 text-gray-300 group-hover:text-brand-600 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
