import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'default' | 'lg';
  dot?: boolean;
  outline?: boolean;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-purple-100 text-purple-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
};

const badgeOutlineVariants = {
  default: 'border border-gray-300 text-gray-700 bg-white',
  primary: 'border border-blue-300 text-blue-700 bg-white',
  secondary: 'border border-purple-300 text-purple-700 bg-white',
  success: 'border border-green-300 text-green-700 bg-white',
  warning: 'border border-yellow-300 text-yellow-700 bg-white',
  danger: 'border border-red-300 text-red-700 bg-white',
  info: 'border border-cyan-300 text-cyan-700 bg-white',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  default: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const dotColors = {
  default: 'bg-gray-400',
  primary: 'bg-blue-500',
  secondary: 'bg-purple-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className,
    variant = 'default',
    size = 'default',
    dot = false,
    outline = false,
    children,
    ...props 
  }, ref) => {
    return (
      <span
        className={cn(
          // Base styles
          'inline-flex items-center font-medium rounded-full transition-colors',
          
          // Variant styles
          outline ? badgeOutlineVariants[variant] : badgeVariants[variant],
          
          // Size styles
          badgeSizes[size],
          
          className
        )}
        ref={ref}
        {...props}
      >
        {dot && (
          <span 
            className={cn(
              'w-2 h-2 rounded-full mr-1.5',
              dotColors[variant]
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status badge variants for common use cases
export const StatusBadge: React.FC<{
  status: 'online' | 'offline' | 'pending' | 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}> = ({ status, children, className }) => {
  const statusConfig = {
    online: { variant: 'success' as const, dot: true },
    offline: { variant: 'default' as const, dot: true },
    pending: { variant: 'warning' as const, dot: true },
    error: { variant: 'danger' as const, dot: true },
    success: { variant: 'success' as const, dot: true },
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant} 
      dot={config.dot} 
      className={className}
    >
      {children}
    </Badge>
  );
};
