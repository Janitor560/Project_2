import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:         'bg-gray-100 text-gray-700',
    PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED:       'bg-blue-100 text-blue-700',
    IN_PRODUCTION:   'bg-purple-100 text-purple-700',
    READY:           'bg-orange-100 text-orange-700',
    SHIPPED:         'bg-cyan-100 text-cyan-700',
    DELIVERED:       'bg-green-100 text-green-700',
    CANCELLED:       'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:         'Pending',
    PAYMENT_PENDING: 'Payment Pending',
    CONFIRMED:       'Confirmed',
    IN_PRODUCTION:   'In Production',
    READY:           'Ready to Ship',
    SHIPPED:         'Shipped',
    DELIVERED:       'Delivered',
    CANCELLED:       'Cancelled',
  };
  return map[status] ?? status;
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    TROPHY:  'Trophy',
    MEDAL:   'Medal',
    PLAQUE:  'Plaque',
    JERSEY:  'Jersey',
    HOODIE:  'Hoodie',
    OTHER:   'Other',
  };
  return map[category] ?? category;
}

export function truncate(str: string, maxLen = 50): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

export function generateOrderRef(id: string): string {
  return '#' + id.slice(-8).toUpperCase();
}
