import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
}

const checkboxSizes = {
  sm: 'w-4 h-4',
  default: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const checkboxVariants = {
  default: 'border-gray-300 text-blue-600 focus:ring-blue-500',
  primary: 'border-gray-300 text-blue-600 focus:ring-blue-500',
  success: 'border-gray-300 text-green-600 focus:ring-green-500',
  warning: 'border-gray-300 text-yellow-600 focus:ring-yellow-500',
  danger: 'border-gray-300 text-red-600 focus:ring-red-500',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    label,
    description,
    error,
    size = 'default',
    variant = 'default',
    indeterminate = false,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    const sizeClass = checkboxSizes[size];
    const variantClass = checkboxVariants[variant];

    // Handle indeterminate state
    React.useEffect(() => {
      if (ref && typeof ref !== 'function') {
        if (ref.current) {
          ref.current.indeterminate = indeterminate;
        }
      }
    }, [indeterminate, ref]);

    const checkbox = (
      <input
        type="checkbox"
        id={checkboxId}
        className={cn(
          // Base styles
          'rounded transition-all duration-200 border-2',
          'focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Size styles
          sizeClass,
          
          // Variant styles
          variantClass,
          
          // Error styles
          error && 'border-red-300 text-red-600 focus:ring-red-500',
          
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label || description) {
      return (
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            {checkbox}
          </div>
          <div className="flex-1">
            {label && (
              <label 
                htmlFor={checkboxId}
                className="block text-sm font-medium text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        </div>
      );
    }

    return checkbox;
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox group component
export interface CheckboxGroupProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  description?: string;
  error?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  defaultValue = [],
  onChange,
  label,
  description,
  error,
  options,
  size = 'default',
  variant = 'default',
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...currentValue, optionValue]
      : currentValue.filter(v => v !== optionValue);
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {(label || description) && (
        <div>
          {label && (
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {label}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 mb-4">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-3">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            size={size}
            variant={variant}
            disabled={option.disabled}
            checked={currentValue.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
