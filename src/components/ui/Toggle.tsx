import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  label?: string;
  description?: string;
  disabled?: boolean;
}

const toggleSizes = {
  sm: {
    switch: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  default: {
    switch: 'w-10 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-5',
  },
  lg: {
    switch: 'w-12 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-6',
  },
};

const toggleVariants = {
  default: {
    on: 'bg-blue-600',
    off: 'bg-gray-200',
  },
  success: {
    on: 'bg-green-600',
    off: 'bg-gray-200',
  },
  warning: {
    on: 'bg-yellow-600',
    off: 'bg-gray-200',
  },
  danger: {
    on: 'bg-red-600',
    off: 'bg-gray-200',
  },
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ 
    checked = false,
    onChange,
    size = 'default',
    variant = 'default',
    label,
    description,
    disabled = false,
    className,
    ...props 
  }, ref) => {
    const sizeConfig = toggleSizes[size];
    const variantConfig = toggleVariants[variant];
    
    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    const toggleButton = (
      <button
        type="button"
        className={cn(
          // Base styles
          'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          
          // Size styles
          sizeConfig.switch,
          
          // Variant styles
          checked ? variantConfig.on : variantConfig.off,
          
          // Disabled styles
          disabled && 'opacity-50 cursor-not-allowed',
          
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          className={cn(
            // Base thumb styles
            'inline-block bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out',
            'ring-0',
            
            // Size styles
            sizeConfig.thumb,
            
            // Position styles
            checked ? sizeConfig.translate : 'translate-x-0.5'
          )}
        />
      </button>
    );

    if (label || description) {
      return (
        <div className="flex items-start space-x-3">
          {toggleButton}
          <div className="flex-1">
            {label && (
              <label className="block text-sm font-medium text-gray-900">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      );
    }

    return toggleButton;
  }
);

Toggle.displayName = 'Toggle';
