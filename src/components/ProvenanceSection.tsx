import { ChevronDown, ExternalLink, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface SourceRef {
  id?: string
  title: string
  description: string
  origin: string
  source: string
  link: string
  collected_at: string
  category: string
  reliability: string
  source_type?: string
  observations: string
}

const reliabilityColors: Record<string, string> = {
  verificada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  alta: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  média: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  baixa: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export function ProvenanceSection({ sources }: { sources: SourceRef[] }) {
  if (!sources || sources.length === 0) return null

  return (
    <details className="group mt-3 border-t border-slate-700/50 pt-2">
      <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-cyan-400 select-none">
        <Info className="w-3 h-3" />
        [INFORMAÇÃO UTILIZADA] — {sources.length} fonte(s)
        <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-2">
        {sources.map((src, i) => (
          <div
            key={src.id || i}
            className="rounded-lg bg-slate-900/60 border border-slate-700/50 p-3 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-slate-200">{src.title}</span>
              <Badge
                variant="outline"
                className={cn('text-[10px] shrink-0', reliabilityColors[src.reliability] || '')}
              >
                {src.reliability}
              </Badge>
            </div>
            {src.description && <p className="text-slate-400 mt-1">{src.description}</p>}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2 text-slate-500">
              <span>Origem: {src.origin || '—'}</span>
              <span>Fonte: {src.source || '—'}</span>
              <span>Data: {src.collected_at || '—'}</span>
              <span>Categoria: {src.category || '—'}</span>
            </div>
            {src.link && (
              <a
                href={src.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline mt-1.5"
              >
                <ExternalLink className="w-3 h-3" /> Validar fonte original
              </a>
            )}
            {src.observations && <p className="text-slate-500 mt-1">Obs: {src.observations}</p>}
          </div>
        ))}
      </div>
    </details>
  )
}
