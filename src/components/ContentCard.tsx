import { useState } from 'react'
import { Copy, Check, Trash2, Clock, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  idea: 'border-slate-600 text-slate-400',
  briefing: 'border-blue-500/30 text-blue-400',
  research: 'border-blue-500/30 text-blue-400',
  draft: 'border-amber-500/30 text-amber-400',
  review: 'border-orange-500/30 text-orange-400',
  approval: 'border-purple-500/30 text-purple-400',
  scheduling: 'border-cyan-500/30 text-cyan-400',
  published: 'border-emerald-500/30 text-emerald-400',
  performance: 'border-emerald-500/30 text-emerald-400',
  archived: 'border-slate-600 text-slate-500',
}

const STATUS_LABELS: Record<string, string> = {
  idea: 'Ideia',
  briefing: 'Briefing',
  research: 'Pesquisa',
  draft: 'Rascunho',
  review: 'Revisão',
  approval: 'Aprovação',
  scheduling: 'Agendado',
  published: 'Publicado',
  performance: 'Performance',
  archived: 'Arquivado',
}

const TYPE_LABELS: Record<string, string> = {
  comunicado: 'Comunicado',
  nota_oficial: 'Nota Oficial',
  pronunciamento: 'Pronunciamento',
  discurso: 'Discurso',
  artigo: 'Artigo',
  release: 'Release',
  legenda: 'Legenda',
  threads: 'Threads',
  newsletter: 'Newsletter',
  roteiro_video: 'Roteiro Vídeo',
  faq: 'FAQ',
  email: 'E-mail',
  resumo_executivo: 'Resumo Exec.',
  texto_whatsapp: 'WhatsApp',
  carrossel: 'Carrossel',
}

interface ContentCardProps {
  item: any
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onCopy: (id: string, content: string) => void
  copiedId: string | null
}

export function ContentCard({
  item,
  onStatusChange,
  onDelete,
  onCopy,
  copiedId,
}: ContentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const contentType = item.idea || ''
  const status = item.status || 'draft'
  const draft = item.draft || ''

  let briefing: any = {}
  try {
    briefing = typeof item.briefing === 'string' ? JSON.parse(item.briefing) : item.briefing || {}
  } catch {
    /* */
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-bold text-white truncate">{item.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {contentType && (
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px]">
                  {TYPE_LABELS[contentType] || contentType}
                </Badge>
              )}
              {item.channel && (
                <Badge
                  variant="outline"
                  className="border-indigo-500/30 text-indigo-400 text-[10px]"
                >
                  {item.channel}
                </Badge>
              )}
              <Badge variant="outline" className={cn('text-[10px]', STATUS_COLORS[status] || '')}>
                {STATUS_LABELS[status] || status}
              </Badge>
              <span className="text-[11px] text-slate-500">
                {new Date(item.created).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-cyan-400"
              onClick={() => onCopy(item.id, draft)}
              title="Copiar"
            >
              {copiedId === item.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-rose-400"
              onClick={() => onDelete(item.id)}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {draft && (
          <div>
            <p
              className={cn(
                'text-xs text-slate-300 whitespace-pre-wrap leading-relaxed',
                !expanded && 'line-clamp-3',
              )}
            >
              {draft}
            </p>
            {draft.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[11px] text-cyan-400 hover:underline mt-1"
              >
                {expanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        )}
        {briefing.hashtags && Array.isArray(briefing.hashtags) && briefing.hashtags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Hash className="w-3 h-3 text-slate-500" />
            {briefing.hashtags.map((tag: string, i: number) => (
              <span key={i} className="text-[10px] text-slate-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          {briefing.tempo_leitura && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {briefing.tempo_leitura}
            </span>
          )}
          {briefing.justificativa && (
            <span className="italic line-clamp-1">— {briefing.justificativa}</span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-500 uppercase">Status:</span>
          <Select value={status} onValueChange={(v) => onStatusChange(item.id, v)}>
            <SelectTrigger className="h-7 w-40 text-[11px] bg-slate-950/60 border-slate-800 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
