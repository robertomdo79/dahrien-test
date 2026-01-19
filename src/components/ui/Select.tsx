import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              `w-full rounded-xl border bg-white px-4 py-2.5 pr-10
              text-surface-900 appearance-none
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              disabled:bg-surface-50 disabled:text-surface-500 disabled:cursor-not-allowed`,
              error
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                : 'border-surface-200 hover:border-surface-300',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-surface-400" />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
