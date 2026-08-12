import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  description?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-green-600',
  iconBg = 'bg-green-50',
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn('stats-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-green-600' : 'text-red-500'
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  )
}
