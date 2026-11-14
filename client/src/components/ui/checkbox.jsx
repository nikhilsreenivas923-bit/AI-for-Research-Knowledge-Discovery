import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Checkbox = React.forwardRef(
  ({ className, checked, onChange, onCheckedChange, id, disabled, ...props }, ref) => {
    const isChecked = Boolean(checked);

    const handleChange = (e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'peer h-4 w-4 shrink-0 rounded-md border border-input bg-background/80 shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50 select-none',
            isChecked && 'bg-primary border-primary text-primary-foreground',
            className
          )}
        >
          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
