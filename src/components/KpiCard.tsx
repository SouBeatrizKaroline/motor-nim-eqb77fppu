import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtext?: string
  icon: ReactNode
  trend?: string
  trendUp?: boolean
  gradient?: string
}

export function KpiCard({ title, value, subtext, icon, trend, trendUp, gradient }: KpiCardProps) {
  return (
    <Card
      className={cn(
        'border-slate-800 bg-slate-900/80 backdrop-blur text-slate-100 shadow-lg relative overflow-hidden',
        gradient,
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/50">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold tracking-tight text-white">{value}</div>
          <div className="flex items-center space-x-2 mt-1">
            {trend && (
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded',
                  trendUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400',
                )}
              >
                {trend}
              </span>
            )}
            {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
