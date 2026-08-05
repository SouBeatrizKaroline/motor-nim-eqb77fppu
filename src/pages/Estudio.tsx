import { useState, useEffect } from 'react'
import { Wand2, Sparkles, Plus, Loader2, FileText, Hash, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getContentItems,
  updateContentItem,
  deleteContentItem,
  triggerContentStudioGenerate,
} from '@/services/intelligence'
import { ContentCard } from '@/components/ContentCard'

const CONTENT_TYPES = [
  { value: 'comunicado', label: 'Comunicado Oficial' },
  { value: 'nota_oficial', label: 'Nota Oficial' },
  { value: 'pronunciamento', label: 'Pronunciamento' },
  { value: 'discurso', label: 'Discurso' },
  { value: 'artigo', label: 'Artigo' },
  { value: 'release', label: 'Release' },
  { value: 'legenda', label: 'Legenda' },
  { value: 'threads', label: 'Threads' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'roteiro_video', label: 'Roteiro para Vídeo' },
  { value: 'faq', label: 'FAQ' },
  { value: 'email', label: 'E-mail' },
  { value: 'resumo_executivo', label: 'Resumo Executivo' },
  { value: 'texto_whatsapp', label: 'Texto para WhatsApp' },
  { value: 'carrossel', label: 'Carrossel' },
]

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'threads', label: 'Threads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'site', label: 'Site' },
  { value: 'newsletter', label: 'Newsletter' },
]

export default function Estudio() {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [contentType, setContentType] = useState('comunicado')
  const [platform, setPlatform] = useState('instagram')
  const [topic, setTopic] = useState('')
  const [tomVoz, setTomVoz] = useState('institucional')
  const [contexto, setContexto] = useState('')
  const [publicoAlvo, setPublicoAlvo] = useState('')

  const loadItems = async () => {
    try {
      setItems((await getContentItems()) || [])
    } catch {
      /* */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])
  useRealtime('content_items', () => loadItems())

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Informe o tema', variant: 'destructive' })
      return
    }
    setGenerating(true)
    setPreview(null)
    try {
      const result = await triggerContentStudioGenerate({
        content_type: contentType,
        platform,
        topic: topic.trim(),
        tom_de_voz: tomVoz,
        contexto: contexto.trim(),
        publico_alvo: publicoAlvo.trim(),
      })
      setPreview(result)
      toast({ title: 'Conteúdo gerado!', description: 'Salvo como rascunho na biblioteca.' })
      setTopic('')
      setContexto('')
      setPublicoAlvo('')
      loadItems()
    } catch (err: any) {
      toast({ title: 'Erro ao gerar', description: err.message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateContentItem(id, { status })
      loadItems()
      toast({ title: 'Status atualizado' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContentItem(id)
      toast({ title: 'Conteúdo removido' })
      loadItems()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-600 shadow-lg shadow-violet-500/20">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground tracking-wide">Núcleo Criativo</h2>
          <p className="text-xs text-muted-foreground">
            Estúdio de criação com IA para comunicação institucional
          </p>
        </div>
      </div>

      <Tabs defaultValue="gerar">
        <TabsList className="bg-slate-900/60 border border-slate-800">
          <TabsTrigger
            value="gerar"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Gerar Conteúdo
          </TabsTrigger>
          <TabsTrigger
            value="biblioteca"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Biblioteca ({items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gerar" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <CardTitle className="text-base font-bold text-white">Configuração</CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Defina os parâmetros para gerar conteúdo com IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Tipo de Conteúdo</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                      {CONTENT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Tema</Label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Serviços prestados pelo mandato"
                    className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Tom de Voz</Label>
                  <Select value={tomVoz} onValueChange={setTomVoz}>
                    <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="institucional">Institucional</SelectItem>
                      <SelectItem value="combativo">Combativo</SelectItem>
                      <SelectItem value="conciliador">Conciliador</SelectItem>
                      <SelectItem value="emocional">Emocional</SelectItem>
                      <SelectItem value="educativo">Educativo</SelectItem>
                      <SelectItem value="dinâmico">Dinâmico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Contexto (opcional)</Label>
                  <Textarea
                    value={contexto}
                    onChange={(e) => setContexto(e.target.value)}
                    placeholder="Notícias, dados, análises..."
                    className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Público-alvo (opcional)</Label>
                  <Input
                    value={publicoAlvo}
                    onChange={(e) => setPublicoAlvo(e.target.value)}
                    placeholder="Ex: Eleitores da região sul"
                    className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-violet-500 to-cyan-600 hover:from-violet-600 hover:to-cyan-700 text-white font-bold shadow-lg shadow-violet-500/20"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Gerar Conteúdo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {generating && (
                <Card className="border-slate-800 bg-slate-900/80">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                    <p className="text-sm text-slate-400">Gerando conteúdo com IA...</p>
                  </CardContent>
                </Card>
              )}
              {!generating && preview && (
                <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-white">
                      {preview.titulo || 'Conteúdo Gerado'}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="border-cyan-500/30 text-cyan-400 text-[10px]"
                      >
                        {CONTENT_TYPES.find((c) => c.value === preview.content_type)?.label ||
                          preview.content_type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-400 text-[10px]"
                      >
                        {PLATFORMS.find((p) => p.value === preview.platform)?.label ||
                          preview.platform}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {preview.slides ? (
                      <div className="space-y-2">
                        {preview.slides.map((slide: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800"
                          >
                            <p className="text-xs font-bold text-cyan-400">
                              Slide {slide.slide || i + 1}: {slide.titulo}
                            </p>
                            <p className="text-xs text-slate-300 mt-1">{slide.texto}</p>
                            {slide.imagem_sugestao && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Imagem: {slide.imagem_sugestao}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {preview.conteudo_medio && (
                          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {preview.conteudo_medio}
                          </p>
                        )}
                        {preview.conteudo_longo && (
                          <details className="mt-2">
                            <summary className="text-xs text-cyan-400 cursor-pointer flex items-center gap-1">
                              <ChevronDown className="w-3 h-3" /> Versão completa
                            </summary>
                            <p className="text-xs text-slate-300 whitespace-pre-wrap mt-2">
                              {preview.conteudo_longo}
                            </p>
                          </details>
                        )}
                      </>
                    )}
                    {preview.hashtags &&
                      Array.isArray(preview.hashtags) &&
                      preview.hashtags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Hash className="w-3 h-3 text-slate-500" />
                          {preview.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] text-slate-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    {preview.cta && (
                      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <p className="text-xs text-cyan-300">
                          <strong>CTA:</strong> {preview.cta}
                        </p>
                      </div>
                    )}
                    {preview.justificativa && (
                      <p className="text-[11px] text-slate-500 italic border-l-2 border-slate-700 pl-2">
                        {preview.justificativa}
                      </p>
                    )}
                    {preview.fontes_contexto &&
                      Array.isArray(preview.fontes_contexto) &&
                      preview.fontes_contexto.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Fontes:</p>
                          {preview.fontes_contexto.map((f: string, i: number) => (
                            <p key={i} className="text-[10px] text-slate-500">
                              • {f}
                            </p>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
              {!generating && !preview && (
                <Card className="border-slate-800 bg-slate-900/60">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Wand2 className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400">
                      Configure os parâmetros e clique em "Gerar Conteúdo"
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      A IA criará um conteúdo profissional pronto para revisão
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="biblioteca" className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">Nenhum conteúdo na biblioteca.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Gere seu primeiro conteúdo na aba "Gerar Conteúdo"
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
