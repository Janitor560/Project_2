import { cn, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('badge', getOrderStatusColor(status), className)}>
      {getOrderStatusLabel(status)}
    </span>
  );
}
