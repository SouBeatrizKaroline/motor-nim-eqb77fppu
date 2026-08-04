import { TrendingUp, Flame } from 'lucide-react'

interface TermChipProps {
  rank: number
  term: string
  delta: number
  mentions?: number
}

export function TermChip({ rank, term, delta, mentions }: TermChipProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs font-bold text-cyan-400">
          #{rank}
        </span>
        <span className="text-sm font-medium text-slate-200">{term}</span>
      </div>
      <div className="flex items-center space-x-2">
        {mentions && <span className="text-xs text-slate-400">{mentions} menções</span>}
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
          <Flame className="w-3 h-3 text-rose-400" />
          <span>+{delta}x</span>
        </span>
      </div>
    </div>
  )
}
