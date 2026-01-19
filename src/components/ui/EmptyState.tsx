import { cn } from '@/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-surface-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-900 font-display mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-surface-500 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
