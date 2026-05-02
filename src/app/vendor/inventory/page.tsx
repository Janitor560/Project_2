'use client';

import { useEffect, useState } from 'react';
import { Warehouse, Save } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast }   from '@/components/providers/ToastProvider';
import { getCategoryLabel } from '@/lib/utils';

interface InventoryRow {
  id:        string;
  vendorId:  string;
  productId: string;
  stock:     number;
  vendor:    { id: string; name: string };
  product:   { id: string; name: string; category: string };
}

export default function VendorInventoryPage() {
  const { toast }   = useToast();
  const [rows,     setRows]     = useState<InventoryRow[]>([]);
  const [edits,    setEdits]    = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((d) => { setRows(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function saveStock(row: InventoryRow) {
    const newStock = edits[row.id] ?? row.stock;
    setSaving(row.id);
    const res  = await fetch('/api/inventory', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ vendorId: row.vendorId, productId: row.productId, stock: newStock }),
    });
    const data = await res.json();
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, stock: data.data.stock } : r));
      setEdits((prev) => { const n = { ...prev }; delete n[row.id]; return n; });
      toast('success', 'Stock updated');
    } else {
      toast('error', 'Update failed', data.error);
    }
    setSaving(null);
  }

  if (loading) return <PageLoader />;

  // Group by vendor
  const vendorMap: Record<string, { name: string; rows: InventoryRow[] }> = {};
  for (const row of rows) {
    if (!vendorMap[row.vendorId]) vendorMap[row.vendorId] = { name: row.vendor.name, rows: [] };
    vendorMap[row.vendorId].rows.push(row);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Warehouse className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      </div>

      {Object.entries(vendorMap).map(([vendorId, vendor]) => (
        <div key={vendorId} className="card overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{vendor.name}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Current Stock</th>
                <th className="px-5 py-3 text-left">Update Stock</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendor.rows.map((row) => {
                const currentEdit = edits[row.id];
                const isDirty     = currentEdit !== undefined && currentEdit !== row.stock;
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{row.product.name}</td>
                    <td className="px-5 py-3">
                      <span className="badge bg-gray-100 text-gray-600">{getCategoryLabel(row.product.category)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold text-sm ${row.stock < 10 ? 'text-red-600' : row.stock < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {row.stock}
                      </span>
                      {row.stock < 10 && <span className="ml-2 badge bg-red-100 text-red-600">Low</span>}
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={0}
                        className="input w-24"
                        value={currentEdit ?? row.stock}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [row.id]: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => saveStock(row)}
                        disabled={saving === row.id || !isDirty}
                        className={`btn-${isDirty ? 'primary' : 'secondary'} text-xs px-3 py-1.5`}
                      >
                        <Save className="h-3 w-3" />
                        {saving === row.id ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
