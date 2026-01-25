import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-primary-50',
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn('text-2xl font-bold text-gray-900', typeof value === 'string' && value.includes('$') && 'currency')}>
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium flex items-center gap-0.5',
                  trend.isPositive ? 'text-success' : 'text-danger'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        )}
      </div>
    </div>
  );
}
