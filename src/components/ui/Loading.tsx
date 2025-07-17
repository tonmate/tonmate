import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  text?: string;
  className?: string;
}

const loadingSizes = {
  sm: 'w-4 h-4',
  default: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const loadingColors = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  current: 'text-current',
};

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const DotsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex space-x-1', className)}>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

const PulseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('relative', className)}>
    <div className="w-full h-full bg-current rounded-full animate-ping opacity-75" />
    <div className="absolute inset-0 w-full h-full bg-current rounded-full animate-pulse" />
  </div>
);

const BarsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-end space-x-1', className)}>
    <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
    <div className="w-1 h-6 bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
    <div className="w-1 h-3 bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
    <div className="w-1 h-5 bg-current animate-pulse" style={{ animationDelay: '450ms' }} />
  </div>
);

export const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  variant = 'spinner',
  color = 'primary',
  text,
  className,
}) => {
  const sizeClass = loadingSizes[size];
  const colorClass = loadingColors[color];

  const renderIcon = () => {
    const iconClassName = cn(sizeClass, colorClass);
    
    switch (variant) {
      case 'dots':
        return <DotsIcon className={iconClassName} />;
      case 'pulse':
        return <PulseIcon className={iconClassName} />;
      case 'bars':
        return <BarsIcon className={iconClassName} />;
      default:
        return <SpinnerIcon className={iconClassName} />;
    }
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        {renderIcon()}
        {text && (
          <span className={cn('text-sm font-medium', colorClass)}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

// Loading overlay component
export interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  text,
  className,
  children,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
};

// Loading skeleton component
export interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 1,
  height = 4,
  animated = true,
}) => {
  const skeletonLines = Array.from({ length: lines }, (_, i) => (
    <div
      key={i}
      className={cn(
        'bg-gray-200 rounded',
        animated && 'animate-pulse',
        className
      )}
      style={{ height: `${height * 0.25}rem` }}
    />
  ));

  return (
    <div className="space-y-2">
      {skeletonLines}
    </div>
  );
};
