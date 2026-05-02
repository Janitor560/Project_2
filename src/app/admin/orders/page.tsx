'use client';

import { useEffect, useState } from 'react';
import { Package, ChevronDown, RefreshCw } from 'lucide-react';
import { StatusBadge }  from '@/components/ui/StatusBadge';
import { PageLoader }   from '@/components/ui/LoadingSpinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { useToast }     from '@/components/providers/ToastProvider';
import { formatCurrency, formatDate, generateOrderRef } from '@/lib/utils';
import type { Order }   from '@/types';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders,  setOrders]   = useState<Order[]>([]);
  const [loading, setLoading]  = useState(true);
  const [filter,  setFilter]   = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    const res = await fetch(`/api/orders${params}`);
    const data = await res.json();
    setOrders(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    const res  = await fetch(`/api/orders/${orderId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
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
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              filter === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order', 'Customer', 'Vendor', 'Status', 'Total', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900">{generateOrderRef(order.id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.user?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.vendor?.name ?? 'Unassigned'}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 pr-6 appearance-none bg-white cursor-pointer"
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {STATUSES.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
