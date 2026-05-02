'use client';

import { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';

interface Analytics {
  totalOrders:     number;
  totalRevenue:    number;
  vendorPerformance: Array<{ vendorName: string; totalOrders: number; revenue: number }>;
  dailyOrders:     Array<{ date: string; revenue: number; orders: number }>;
}

export default function AnalyticsPage() {
  const [data, setData]       = useState<Analytics | null>(null);
  const [days, setDays]       = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
        <select
          className="input w-32"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : !data ? (
        <p className="text-gray-500">Failed to load analytics.</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-brand-700 mt-1">{data.totalOrders}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(data.totalRevenue)}</p>
            </div>
          </div>

          {/* Daily revenue */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [formatCurrency(v as number), 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#c026d3" strokeWidth={2} dot={false} name="Revenue ($)" />
                <Line type="monotone" dataKey="orders"  stroke="#0ea5e9" strokeWidth={2} dot={false} name="Orders" yAxisId={0} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vendor comparison */}
          {data.vendorPerformance.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Vendor Comparison</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.vendorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="vendorName" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left"  dataKey="totalOrders" fill="#c026d3" name="Orders"         radius={[4,4,0,0]} />
                  <Bar yAxisId="right" dataKey="revenue"     fill="#0ea5e9" name="Revenue ($)"    radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
