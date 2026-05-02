'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Trophy, Bell, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [menuOpen, setMenuOpen] = useState(false);

  const role = session?.user?.role;

  const dashboardLink =
    role === 'ADMIN'  ? '/admin'  :
    role === 'VENDOR' ? '/vendor' : null;

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <Trophy className="h-7 w-7 text-gold-500" />
            <span className="hidden sm:block">AwardsPro</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors">
              Products
            </Link>
            <Link href="/products?category=TROPHY" className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors">
              Trophies
            </Link>
            <Link href="/products?category=MEDAL" className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors">
              Medals
            </Link>
            <Link href="/products?category=JERSEY" className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors">
              Apparel
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {dashboardLink && (
                  <Link href={dashboardLink} className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}

                <Link href="/orders" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700">
                  My Orders
                </Link>

                <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-brand-700">
                  <Bell className="h-5 w-5" />
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="hidden md:block text-sm font-medium text-gray-600 hover:text-brand-700">
                  Sign in
                </Link>
                <Link href="/auth/register" className="hidden md:block btn-primary">
                  Get started
                </Link>
              </>
            )}

            {/* Cart */}
            <Link href="/checkout" className="relative p-2 text-gray-500 hover:text-brand-700">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2 space-y-2">
          <MobileLink href="/products"            onClick={() => setMenuOpen(false)}>All Products</MobileLink>
          <MobileLink href="/products?category=TROPHY" onClick={() => setMenuOpen(false)}>Trophies</MobileLink>
          <MobileLink href="/products?category=MEDAL"  onClick={() => setMenuOpen(false)}>Medals</MobileLink>
          <MobileLink href="/products?category=JERSEY" onClick={() => setMenuOpen(false)}>Apparel</MobileLink>
          {session ? (
            <>
              <MobileLink href="/orders"   onClick={() => setMenuOpen(false)}>My Orders</MobileLink>
              {dashboardLink && (
                <MobileLink href={dashboardLink} onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
              )}
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                className="flex w-full items-center gap-2 py-2 text-sm font-medium text-red-600"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/auth/signin"   onClick={() => setMenuOpen(false)}>Sign in</MobileLink>
              <MobileLink href="/auth/register" onClick={() => setMenuOpen(false)}>Get started</MobileLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-brand-700"
    >
      {children}
    </Link>
  );
}
