'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';
import { StatusBadge }    from '@/components/ui/StatusBadge';
import { PageLoader }     from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, generateOrderRef } from '@/lib/utils';
import type { Order }     from '@/types';

export default function VendorDashboardPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders?pageSize=50')
      .then((r) => r.json())
      .then((d) => { setOrders(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const pending    = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PENDING');
  const production = orders.filter((o) => o.status === 'IN_PRODUCTION');
  const ready      = orders.filter((o) => o.status === 'READY');
  const shipped    = orders.filter((o) => o.status === 'SHIPPED');

  const stats = [
    { label: 'Awaiting',     value: pending.length,    icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'In Production',value: production.length, icon: Package,       color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ready',        value: ready.length,      icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Shipped',      value: shipped.length,    icon: Truck,         color: 'text-blue-600',   bg: 'bg-blue-50'   },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-sm text-gray-500">Manage your assigned orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions: pending orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Orders Requiring Action</h2>
          <Link href="/vendor/orders" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>

        {pending.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No pending orders</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm font-medium text-gray-900">{generateOrderRef(order.id)}</span>
                  <StatusBadge status={order.status} className="ml-2" />
                  <p className="text-xs text-gray-400 mt-0.5">{order.items?.length ?? 0} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">{formatCurrency(order.totalPrice)}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <Link href={`/vendor/orders/${order.id}`} className="btn-primary text-xs px-3 py-1.5">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
