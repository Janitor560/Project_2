'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, Users, DollarSign, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Truck
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { StatusBadge }    from '@/components/ui/StatusBadge';
import { PageLoader }     from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, generateOrderRef } from '@/lib/utils';

const PIE_COLORS = ['#c026d3','#0ea5e9','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6'];

interface Analytics {
  totalOrders:     number;
  totalRevenue:    number;
  ordersByStatus:  Array<{ status: string; count: number }>;
  recentOrders:    Array<{ id: string; status: string; totalPrice: number; createdAt: string; user: { name: string }; vendor: { name: string } | null }>;
  vendorPerformance: Array<{ vendorId: string; vendorName: string; totalOrders: number; revenue: number }>;
  dailyOrders:     Array<{ date: string; revenue: number; orders: number }>;
}

export default function AdminDashboardPage() {
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics?days=30')
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data)   return <div className="text-gray-500">Failed to load analytics.</div>;

  const statCards = [
    { label: 'Total Orders (30d)',  value: data.totalOrders,                      icon: Package,     color: 'text-brand-600',  bg: 'bg-brand-50' },
    { label: 'Revenue (30d)',       value: formatCurrency(data.totalRevenue),      icon: DollarSign,  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Active Vendors',      value: data.vendorPerformance.length,          icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-50'  },
    { label: 'Avg Order Value',     value: formatCurrency(data.totalOrders ? data.totalRevenue / data.totalOrders : 0), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HQ Dashboard</h1>
        <p className="text-sm text-gray-500">Last 30 days overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
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

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue & Orders</h2>
          {data.dailyOrders.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => n === 'revenue' ? formatCurrency(v as number) : v} />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="revenue" stroke="#c026d3" strokeWidth={2} dot={false} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="orders"  stroke="#0ea5e9" strokeWidth={2} dot={false} name="Orders"  />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-400 text-sm">No data for this period</div>
          )}
        </div>

        {/* Status pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {data.ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {data.ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Vendor performance */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Vendor Performance</h2>
        {data.vendorPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.vendorPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="vendorName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => v} />
              <Bar dataKey="totalOrders" fill="#c026d3" name="Orders" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">No vendor data</div>
        )}
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">{generateOrderRef(order.id)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.user?.name} · {order.vendor?.name ?? 'Unassigned'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(order.totalPrice)}</p>
                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
              <Link href={`/admin/orders/${order.id}`} className="text-xs text-brand-600 hover:underline shrink-0">
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
