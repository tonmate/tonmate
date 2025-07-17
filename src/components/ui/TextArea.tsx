import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outline';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const textAreaVariants = {
  default: 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
  filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500',
  outline: 'border-2 border-gray-200 bg-transparent focus:border-blue-500',
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    variant = 'default',
    resize = 'vertical',
    id,
    rows = 4,
    ...props 
  }, ref) => {
    const textAreaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textAreaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textAreaId}
          rows={rows}
          className={cn(
            // Base styles
            'w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            
            // Resize handling
            resize === 'none' ? 'resize-none' : 
            resize === 'vertical' ? 'resize-y' : 
            resize === 'horizontal' ? 'resize-x' : 'resize',
            
            // Variant styles
            textAreaVariants[variant],
            
            // Error styles
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
            
            className
          )}
          ref={ref}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
