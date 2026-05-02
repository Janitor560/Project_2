import Link from 'next/link';
import { Trophy, LayoutDashboard, Users, Package, BarChart2, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-brand-900 text-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-brand-800">
          <Trophy className="h-7 w-7 text-gold-400" />
          <span className="font-bold text-lg">AwardsPro HQ</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin',           icon: LayoutDashboard, label: 'Dashboard'    },
            { href: '/admin/orders',    icon: Package,         label: 'Orders'       },
            { href: '/admin/vendors',   icon: Users,           label: 'Vendors'      },
            { href: '/admin/analytics', icon: BarChart2,       label: 'Analytics'    },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-200 hover:bg-brand-800 hover:text-white transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-800 space-y-1">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-400 hover:text-white">
            <LogOut className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="md:hidden flex items-center gap-2 text-brand-700 font-bold">
            <Trophy className="h-6 w-6 text-gold-400" /> Admin
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/auth/signin" className="text-sm text-gray-500 hover:text-brand-700">Sign out</Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
