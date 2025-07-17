import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  description?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const sliderSizes = {
  sm: {
    track: 'h-1',
    thumb: 'w-4 h-4',
    container: 'py-2',
  },
  default: {
    track: 'h-2',
    thumb: 'w-5 h-5',
    container: 'py-3',
  },
  lg: {
    track: 'h-3',
    thumb: 'w-6 h-6',
    container: 'py-4',
  },
};

const sliderVariants = {
  default: 'bg-blue-600',
  primary: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    value,
    defaultValue = 0,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    label,
    description,
    showValue = true,
    formatValue,
    size = 'default',
    variant = 'default',
    disabled = false,
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const trackRef = useRef<HTMLDivElement>(null);
    
    const currentValue = value !== undefined ? value : internalValue;
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    const sizeConfig = sliderSizes[size];
    const variantColor = sliderVariants[variant];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    const displayValue = formatValue ? formatValue(currentValue) : currentValue.toString();

    return (
      <div className={cn('w-full', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-gray-500 font-medium">
                {displayValue}
              </span>
            )}
          </div>
        )}
        
        <div className={cn('relative', sizeConfig.container)}>
          {/* Track */}
          <div
            ref={trackRef}
            className={cn(
              'absolute w-full rounded-full bg-gray-200',
              sizeConfig.track,
              'top-1/2 -translate-y-1/2'
            )}
          />
          
          {/* Progress */}
          <div
            className={cn(
              'absolute rounded-full transition-all duration-150',
              sizeConfig.track,
              variantColor,
              'top-1/2 -translate-y-1/2'
            )}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Input */}
          <input
            type="range"
            ref={ref}
            value={currentValue}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              // Base styles
              'absolute w-full h-full opacity-0 cursor-pointer',
              'focus:outline-none',
              disabled && 'cursor-not-allowed',
              
              // Custom thumb styles via CSS
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:bg-white',
              '[&::-webkit-slider-thumb]:border-2',
              `[&::-webkit-slider-thumb]:border-${variantColor.replace('bg-', '')}`,
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:transition-all',
              '[&::-webkit-slider-thumb]:duration-150',
              `[&::-webkit-slider-thumb]:${sizeConfig.thumb}`,
              
              // Firefox styles
              '[&::-moz-range-thumb]:appearance-none',
              '[&::-moz-range-thumb]:bg-white',
              '[&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:shadow-md',
              `[&::-moz-range-thumb]:${sizeConfig.thumb}`,
              
              // Focus styles
              'focus:[&::-webkit-slider-thumb]:ring-2',
              'focus:[&::-webkit-slider-thumb]:ring-blue-500',
              'focus:[&::-webkit-slider-thumb]:ring-offset-2',
            )}
            {...props}
          />
        </div>
        
        {description && (
          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// Range slider component (for min/max values)
export interface RangeSliderProps extends Omit<SliderProps, 'value' | 'onChange' | 'defaultValue'> {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  defaultValue = [0, 100],
  min = 0,
  max = 100,
  onChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState<[number, number]>(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;
  const [minVal, maxVal] = currentValue;

  const handleMinChange = (newMin: number) => {
    const newValue: [number, number] = [Math.min(newMin, maxVal), maxVal];
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleMaxChange = (newMax: number) => {
    const newValue: [number, number] = [minVal, Math.max(newMax, minVal)];
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className="space-y-4">
      <Slider
        {...props}
        value={minVal}
        min={min}
        max={max}
        onChange={handleMinChange}
        label={props.label ? `${props.label} (Min)` : 'Minimum'}
      />
      <Slider
        {...props}
        value={maxVal}
        min={min}
        max={max}
        onChange={handleMaxChange}
        label={props.label ? `${props.label} (Max)` : 'Maximum'}
      />
    </div>
  );
};
