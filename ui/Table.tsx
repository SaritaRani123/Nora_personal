import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn('bg-gray-50/50', className)}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn('bg-white divide-y divide-gray-100', className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <tr className={cn('transition-colors', hover && 'hover:bg-gray-50/50', className)}>{children}</tr>
  );
}

export function TableCell({
  children,
  className,
  align = 'left',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <td
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  );
}
