'use client';

import { useEffect, useState } from 'react';
import { Users, MapPin, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { PageLoader }  from '@/components/ui/LoadingSpinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { useToast }    from '@/components/providers/ToastProvider';
import type { Vendor } from '@/types';

export default function AdminVendorsPage() {
  const { toast }   = useToast();
  const [vendors, setVendors]   = useState<(Vendor & { _count: { orders: number } })[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/vendors?active=false')
      .then((r) => r.json())
      .then((d) => { setVendors(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    const res  = await fetch(`/api/vendors/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: !current }),
    });
    const data = await res.json();
    if (res.ok) {
      setVendors((prev) => prev.map((v) => v.id === id ? { ...v, isActive: !current } : v));
      toast('success', `Vendor ${current ? 'deactivated' : 'activated'}`);
    } else {
      toast('error', 'Update failed', data.error);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <button className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Vendor
        </button>
      </div>

      {vendors.length === 0 ? (
        <EmptyState icon={Users} title="No vendors" description="Add your first partner vendor." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className={`card p-5 ${!vendor.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    {vendor.isHQ && <span className="badge bg-gold-100 text-gold-700">HQ</span>}
                  </div>
                  <p className="text-xs text-gray-400">{vendor.email}</p>
                </div>
                <button
                  onClick={() => toggleActive(vendor.id, vendor.isActive)}
                  className={`rounded-full p-1 transition-colors ${vendor.isActive ? 'text-green-500 hover:text-red-500' : 'text-gray-300 hover:text-green-500'}`}
                  title={vendor.isActive ? 'Deactivate' : 'Activate'}
                >
                  {vendor.isActive ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </button>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-gray-400 shrink-0" />
                  {vendor.address}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Radius: {vendor.serviceRadius} km</span>
                  <span>Capacity: {vendor.capacity}/day</span>
                  <span>Orders: {vendor._count?.orders ?? 0}</span>
                </div>
              </div>

              {vendor.serviceAreas?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {vendor.serviceAreas.map((a) => (
                    <span key={a} className="badge bg-gray-100 text-gray-600">{a}</span>
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
