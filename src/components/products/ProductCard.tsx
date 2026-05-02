import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <span className="absolute top-2 left-2 badge bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
          {getCategoryLabel(product.category)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">From</span>
            <p className="text-lg font-bold text-brand-700">{formatCurrency(product.basePrice)}</p>
          </div>

          <Link
            href={`/products/${product.id}/customize`}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
}
