import Link from 'next/link';
import { Trophy, LayoutDashboard, Package, Warehouse, LogOut } from 'lucide-react';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-800">
          <Trophy className="h-7 w-7 text-gold-400" />
          <span className="font-bold text-lg">Vendor Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/vendor',           icon: LayoutDashboard, label: 'Dashboard'  },
            { href: '/vendor/orders',    icon: Package,         label: 'My Orders'  },
            { href: '/vendor/inventory', icon: Warehouse,       label: 'Inventory'  },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-white">
            <LogOut className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <span className="font-semibold text-gray-900 md:hidden">Vendor Portal</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
