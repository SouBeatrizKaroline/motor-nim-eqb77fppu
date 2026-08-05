import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Sparkles, Loader2, User, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { askImagisAgent, type AskAgentResult, type AgentSourceReference } from '@/services/imagis'
import { ProvenanceSection } from '@/components/ProvenanceSection'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: AgentSourceReference[]
  is_audit?: boolean
}

const SUGGESTED_PROMPTS = [
  'Quais temas tiveram maior crescimento esta semana?',
  'Quais publicações tiveram melhor desempenho e por quê?',
  'Sugira oportunidades de pauta com base nas tendências atuais',
  'Como evoluiu a percepção pública recente? Quais os riscos?',
]

export default function Assistente() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sourceCount, setSourceCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useRealtime('source_references', () => {
    setSourceCount((c) => c + 1)
  })

  const handleSend = async (text?: string) => {
    const message = (text ?? input).trim()
    if (!message || loading) return

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: message }])
    setInput('')
    setLoading(true)

    try {
      const result: AskAgentResult = await askImagisAgent(message, conversationId)
      if (result.conversation_id) setConversationId(result.conversation_id)
      setMessages((prev) => [
        ...prev,
        {
          id: result.message_id || crypto.randomUUID(),
          role: 'assistant',
          content: result.content || 'Não foi possível obter uma resposta.',
          sources: result.sources || [],
          is_audit: result.is_audit || false,
        },
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
        },
      ])
      toast({
        title: 'Erro de comunicação',
        description: err?.message || 'Falha ao consultar o assistente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isAudit = input.trim().toUpperCase() === '/AUDITAR'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              Copiloto Estratégico Imagis
            </h2>
            <p className="text-xs text-slate-400">
              Pesquisador, estrategista e analista com rastreabilidade de fontes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {sourceCount > 0 && (
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {sourceCount} fontes rastreadas
            </Badge>
          )}
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Online
          </Badge>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 text-slate-100 flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="p-4 rounded-2xl bg-slate-800/60 mb-4">
                  <Bot className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">
                  Análise Estratégica com IA
                </h3>
                <p className="text-sm text-slate-400 max-w-md mb-6">
                  Atuo como pesquisador e estrategista. Cada análise inclui fontes rastreáveis e
                  verificáveis. Digite{' '}
                  <code className="text-cyan-400 bg-slate-800 px-1 rounded">/AUDITAR</code> para
                  auditar a última resposta.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-xs text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3 animate-fade-in-up',
                      msg.role === 'user' && 'flex-row-reverse',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        msg.role === 'user'
                          ? 'bg-indigo-600/30 border border-indigo-500/40'
                          : msg.is_audit
                            ? 'bg-amber-600/30 border border-amber-500/40'
                            : 'bg-cyan-600/30 border border-cyan-500/40',
                      )}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-indigo-300" />
                      ) : msg.is_audit ? (
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-cyan-300" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap',
                        msg.role === 'user'
                          ? 'bg-indigo-600/20 text-slate-100 border border-indigo-500/20'
                          : msg.is_audit
                            ? 'bg-amber-950/40 text-slate-200 border border-amber-700/30 shadow-md'
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700 shadow-md',
                      )}
                    >
                      {msg.is_audit && (
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-amber-400">
                          <ShieldCheck className="w-4 h-4" /> RELATÓRIO DE AUDITORIA
                        </div>
                      )}
                      {msg.content}
                      {msg.sources && msg.sources.length > 0 && (
                        <ProvenanceSection sources={msg.sources} />
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-xs text-slate-400">Processando...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-slate-800 p-3 bg-slate-900/90">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (ou /AUDITAR para auditar)"
                disabled={loading}
                className={cn(
                  'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500',
                  isAudit ? 'border-amber-500/50 focus:border-amber-500' : 'focus:border-cyan-500',
                )}
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className={cn(
                  'font-bold shrink-0',
                  isAudit
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950',
                )}
                size="icon"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAudit ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
