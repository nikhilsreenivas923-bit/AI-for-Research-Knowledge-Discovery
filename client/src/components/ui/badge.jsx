import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default:
      'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80',
    secondary:
      'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline:
      'text-foreground border-border/80 bg-background/50',
    subtle:
      'border-transparent bg-primary/10 text-primary border border-primary/20',
    academic:
      'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300',
    market:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    legal:
      'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
    corporate:
      'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}
