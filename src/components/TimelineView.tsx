import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  label: string
  status: 'completed' | 'current' | 'pending' | 'error'
  detail?: string
}

interface TimelineViewProps {
  steps: Step[]
}

export function TimelineView({ steps }: TimelineViewProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed'
        const isCurrent = step.status === 'current'
        const isError = step.status === 'error'

        return (
          <div key={step.id} className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isCurrent && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {step.status === 'pending' && <Circle className="w-5 h-5 text-slate-600" />}
              </div>
              <div>
                <p
                  className={cn(
                    'text-xs font-semibold',
                    isCompleted
                      ? 'text-emerald-400'
                      : isCurrent
                        ? 'text-cyan-400'
                        : isError
                          ? 'text-rose-400'
                          : 'text-slate-500',
                  )}
                >
                  {step.label}
                </p>
                {step.detail && <p className="text-[10px] text-slate-400">{step.detail}</p>}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="hidden md:block w-8 h-[2px] bg-slate-800 flex-1 mx-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}
