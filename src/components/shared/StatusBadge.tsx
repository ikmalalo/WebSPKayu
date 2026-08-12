import { cn, getStatusLabel, getStatusColor, type StatusColor } from '@/lib/utils'
import type { StatusPengajuan } from '@/types'

interface StatusBadgeProps {
  status: StatusPengajuan
  className?: string
}

const colorMap: Record<StatusColor, string> = {
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
}

const dotColorMap: Record<StatusColor, string> = {
  gray: 'bg-slate-400',
  yellow: 'bg-amber-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  green: 'bg-green-600',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-600',
  rose: 'bg-rose-500',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = getStatusColor(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        colorMap[color],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColorMap[color])} />
      {getStatusLabel(status)}
    </span>
  )
}

// Generic badge for non-status values
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray'
  className?: string
}

const badgeVariants: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  gray: 'bg-slate-100 text-slate-500 border-slate-200',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
