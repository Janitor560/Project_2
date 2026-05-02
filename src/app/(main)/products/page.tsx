'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategoryLabel } from '@/lib/utils';
import type { Product, ProductCategory } from '@/types';

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: '',        label: 'All'     },
  { value: 'TROPHY',  label: 'Trophies' },
  { value: 'MEDAL',   label: 'Medals'   },
  { value: 'PLAQUE',  label: 'Plaques'  },
  { value: 'JERSEY',  label: 'Jerseys'  },
  { value: 'HOODIE',  label: 'Hoodies'  },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const category = searchParams.get('category') ?? '';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search)   params.set('search', search);

    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setProducts(data.data ?? []); setLoading(false); })
      .catch((err) => { if (err.name !== 'AbortError') setLoading(false); });

    return () => controller.abort();
  }, [category, search]);

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set('category', cat); else params.delete('category');
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category ? getCategoryLabel(category) : 'All Products'}
        </h1>
        <p className="mt-1 text-gray-500">Customise and order with fast delivery.</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                category === c.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none placeholder:text-gray-400 w-40"
          />
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No products found"
          description="Try a different category or search term."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
