import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'default' | 'lg';
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: 'default' | 'header';
  align?: 'left' | 'center' | 'right';
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const tableVariants = {
      default: 'border-collapse w-full',
      striped: 'border-collapse w-full',
      bordered: 'border-collapse w-full border border-gray-300'
    };

    const tableSizes = {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg'
    };

    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            tableVariants[variant],
            tableSizes[size],
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-gray-50', className)}
      {...props}
    />
  )
);

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('bg-white divide-y divide-gray-200', className)}
      {...props}
    />
  )
);

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        hover && 'hover:bg-gray-50 transition-colors',
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return (
      <th
        ref={ref}
        className={cn(
          'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
          alignClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);

TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, variant = 'default', align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    const variantClasses = {
      default: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
      header: 'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'
    };

    return (
      <td
        ref={ref}
        className={cn(
          variantClasses[variant],
          alignClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);

TableCell.displayName = 'TableCell';
