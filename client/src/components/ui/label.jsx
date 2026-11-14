import React from 'react';
import { cn } from '../../lib/utils';

export const Label = React.forwardRef(({ className, htmlFor, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={cn(
      'text-xs font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer',
      className
    )}
    {...props}
  />
));

Label.displayName = 'Label';
