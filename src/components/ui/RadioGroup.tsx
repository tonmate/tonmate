import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const radioSizes = {
  sm: 'w-4 h-4',
  default: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const radioVariants = {
  default: 'border-gray-300 text-blue-600 focus:ring-blue-500',
  primary: 'border-gray-300 text-blue-600 focus:ring-blue-500',
  success: 'border-gray-300 text-green-600 focus:ring-green-500',
  warning: 'border-gray-300 text-yellow-600 focus:ring-yellow-500',
  danger: 'border-gray-300 text-red-600 focus:ring-red-500',
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className,
    label,
    description,
    size = 'default',
    variant = 'default',
    id,
    ...props 
  }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    
    const sizeClass = radioSizes[size];
    const variantClass = radioVariants[variant];

    const radio = (
      <input
        type="radio"
        id={radioId}
        className={cn(
          // Base styles
          'transition-all duration-200 border-2',
          'focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Size styles
          sizeClass,
          
          // Variant styles
          variantClass,
          
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
            {radio}
          </div>
          <div className="flex-1">
            {label && (
              <label 
                htmlFor={radioId}
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
          </div>
        </div>
      );
    }

    return radio;
  }
);

Radio.displayName = 'Radio';

// Radio group component
export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  description?: string;
  error?: string;
  options: RadioOption[];
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue = '',
  onChange,
  name,
  label,
  description,
  error,
  options,
  size = 'default',
  variant = 'default',
  orientation = 'vertical',
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
  };

  const containerClass = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-6' 
    : 'space-y-3';

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
      
      <div className={containerClass}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            size={size}
            variant={variant}
            disabled={option.disabled}
            checked={currentValue === option.value}
            onChange={() => handleChange(option.value)}
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
