'use client';

import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationStore {
  notifications:  Notification[];
  unreadCount:    number;
  setNotifications: (items: Notification[]) => void;
  markRead:       (id: string) => void;
  markAllRead:    () => void;
  addNotification: (n: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications(items) {
    set({
      notifications: items,
      unreadCount: items.filter((n) => !n.isRead).length,
    });
  },

  markRead(id) {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return { notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length };
    });
  },

  markAllRead() {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  addNotification(n) {
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.isRead ? 0 : 1),
    }));
  },
}));
