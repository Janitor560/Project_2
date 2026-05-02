'use client';

import { useEffect, useState } from 'react';
import { useSession }   from 'next-auth/react';
import { useRouter }    from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { PageLoader }   from '@/components/ui/LoadingSpinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { formatRelative } from '@/lib/utils';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { status } = useSession();
  const router     = useRouter();
  const [notifs,   setNotifs]  = useState<Notification[]>([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return; }
    if (status !== 'authenticated')  return;

    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => { setNotifs(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, router]);

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand-600" /> Notifications
        </h1>
        {notifs.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`card p-4 transition-colors ${!n.isRead ? 'border-brand-200 bg-brand-50/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-gray-200' : 'bg-brand-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
