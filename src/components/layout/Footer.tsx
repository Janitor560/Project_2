import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
              <Trophy className="h-6 w-6 text-gold-500" />
              AwardsPro
            </Link>
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              Custom awards, trophies, and apparel delivered fast. Powered by smart vendor routing.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/products?category=TROPHY" className="hover:text-brand-700">Trophies</Link></li>
              <li><Link href="/products?category=MEDAL"  className="hover:text-brand-700">Medals</Link></li>
              <li><Link href="/products?category=PLAQUE" className="hover:text-brand-700">Plaques</Link></li>
              <li><Link href="/products?category=JERSEY" className="hover:text-brand-700">Jerseys</Link></li>
              <li><Link href="/products?category=HOODIE" className="hover:text-brand-700">Hoodies</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/about"   className="hover:text-brand-700">About us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-700">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/auth/signin"  className="hover:text-brand-700">Sign in</Link></li>
              <li><Link href="/auth/register" className="hover:text-brand-700">Register</Link></li>
              <li><Link href="/orders"       className="hover:text-brand-700">My Orders</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} AwardsPro. All rights reserved.</p>
          <p className="text-xs text-gray-400">Secured by Stripe · Images via Cloudinary</p>
        </div>
      </div>
    </footer>
  );
}
