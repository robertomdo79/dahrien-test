import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-primary-600 to-primary-500
        hover:from-primary-500 hover:to-primary-400
        text-white shadow-lg shadow-primary-500/25
        focus:ring-primary-500
      `,
      secondary: `
        bg-gradient-to-r from-accent-500 to-accent-400
        hover:from-accent-400 hover:to-accent-300
        text-white shadow-lg shadow-accent-500/25
        focus:ring-accent-500
      `,
      outline: `
        border-2 border-primary-500 text-primary-600
        hover:bg-primary-50 hover:border-primary-600
        focus:ring-primary-500
      `,
      ghost: `
        text-surface-600 hover:bg-surface-100
        hover:text-surface-900
        focus:ring-surface-500
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-500
        hover:from-red-500 hover:to-red-400
        text-white shadow-lg shadow-red-500/25
        focus:ring-red-500
      `,
      warning: `
        bg-gradient-to-r from-amber-500 to-amber-400
        hover:from-amber-400 hover:to-amber-300
        text-white shadow-lg shadow-amber-500/25
        focus:ring-amber-500
      `,
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
