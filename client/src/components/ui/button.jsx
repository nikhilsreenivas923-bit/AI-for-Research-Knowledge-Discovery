import React from 'react';
import { cn } from '../../lib/utils';

export const buttonVariants = ({
  variant = 'default',
  size = 'default',
  className = '',
} = {}) => {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer select-none';

  const variants = {
    default:
      'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:bg-primary/95 hover:scale-[1.02]',
    glow:
      'bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow-md hover:scale-[1.02]',
    destructive:
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:scale-[1.02]',
    outline:
      'border border-border/70 bg-card/60 backdrop-blur-sm text-foreground hover:bg-accent/80 hover:text-accent-foreground hover:border-primary/40 hover:scale-[1.02] shadow-xs',
    secondary:
      'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:scale-[1.02]',
    ghost:
      'text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:scale-[1.02]',
    link:
      'text-primary underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-xs',
    sm: 'h-8 px-3 text-xs rounded-xl',
    lg: 'h-11 px-6 text-sm rounded-2xl',
    icon: 'h-9 w-9 p-0 rounded-xl',
    'icon-sm': 'h-8 w-8 p-0 rounded-xl',
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
