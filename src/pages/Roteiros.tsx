import { useState, useEffect } from 'react'
import { Video, Plus, Trash2, Sparkles, Copy, Check, Hash } from 'lucide-react'
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
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getRetentionScripts, deleteRetentionScript, triggerScriptGenerate } from '@/services/nim'

export default function Roteiros() {
  const { toast } = useToast()
  const [scripts, setScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [plataforma, setPlataforma] = useState('reels')
  const [tipoConteudo, setTipoConteudo] = useState('')
  const [tema, setTema] = useState('')
  const [tomDeVoz, setTomDeVoz] = useState('dinâmico')

  const loadScripts = async () => {
    try {
      const data = await getRetentionScripts()
      setScripts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScripts()
  }, [])

  useRealtime('retention_scripts', () => loadScripts())

  const handleGenerate = async () => {
    if (!tema.trim()) {
      toast({
        title: 'Informe o tema',
        description: 'O tema é obrigatório para gerar o roteiro.',
        variant: 'destructive',
      })
      return
    }
    setGenerating(true)
    try {
      await triggerScriptGenerate({
        plataforma,
        tipo_conteudo: tipoConteudo.trim() || 'educação',
        tema: tema.trim(),
        tom_de_voz: tomDeVoz,
      })
      toast({
        title: 'Roteiro gerado!',
        description: 'O roteiro de retenção foi criado e salvo com sucesso.',
      })
      setTema('')
      setTipoConteudo('')
      loadScripts()
    } catch (err: any) {
      toast({ title: 'Erro ao gerar roteiro', description: err.message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRetentionScript(id)
      toast({ title: 'Roteiro removido' })
      loadScripts()
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' })
    }
  }

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* noop */
    }
  }

  const platformLabel = (p: string) => {
    const map: Record<string, string> = { reels: 'Reels', tiktok: 'TikTok', shorts: 'Shorts' }
    return map[p] || p
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/80 text-slate-100 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-base font-bold text-white">Novo Roteiro</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Configure os parâmetros e gere um roteiro de retenção com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Plataforma</Label>
              <Select value={plataforma} onValueChange={setPlataforma}>
                <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-xs text-slate-300">
                Tipo de Conteúdo
              </Label>
              <Input
                id="tipo"
                value={tipoConteudo}
                onChange={(e) => setTipoConteudo(e.target.value)}
                placeholder="Ex: educação, bastidores, trending"
                className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tema" className="text-xs text-slate-300">
                Tema
              </Label>
              <Input
                id="tema"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Serviços prestados pelo mandato"
                className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Tom de Voz</Label>
              <Select value={tomDeVoz} onValueChange={setTomDeVoz}>
                <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="dinâmico">Dinâmico</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="humorístico">Humorístico</SelectItem>
                  <SelectItem value="inspirador">Inspirador</SelectItem>
                  <SelectItem value="educativo">Educativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
            >
              {generating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Roteiro
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Roteiros Gerados</h3>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {scripts.length} registro(s)
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : scripts.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Video className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">Nenhum roteiro gerado ainda.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Use o formulário ao lado para criar o primeiro.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scripts.map((script) => (
                <Card key={script.id} className="border-slate-800 bg-slate-900/80 text-slate-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-bold text-white truncate">
                          {script.tema || script.tipo_conteudo || 'Roteiro sem título'}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {script.platform && (
                            <Badge
                              variant="outline"
                              className="border-cyan-500/30 text-cyan-400 text-[10px]"
                            >
                              {platformLabel(script.platform)}
                            </Badge>
                          )}
                          {script.tom_de_voz && (
                            <Badge
                              variant="outline"
                              className="border-indigo-500/30 text-indigo-400 text-[10px]"
                            >
                              {script.tom_de_voz}
                            </Badge>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {new Date(script.created).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                          onClick={() =>
                            handleCopy(
                              script.id,
                              script.roteiro_detalhado || script.texto_legenda || '',
                            )
                          }
                          title="Copiar roteiro"
                        >
                          {copiedId === script.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => handleDelete(script.id)}
                          title="Excluir roteiro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {script.hook && (
                    <CardContent className="pt-0 pb-2">
                      <p className="text-xs font-semibold text-cyan-300 mb-1">Hook</p>
                      <p className="text-xs text-slate-300 line-clamp-2">{script.hook}</p>
                    </CardContent>
                  )}
                  {script.roteiro_detalhado && (
                    <CardContent className="pt-0 pb-2">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Roteiro</p>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                        {script.roteiro_detalhado}
                      </p>
                    </CardContent>
                  )}
                  {script.texto_legenda && (
                    <CardContent className="pt-0 pb-2">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Legenda</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{script.texto_legenda}</p>
                    </CardContent>
                  )}
                  {script.hashtags &&
                    Array.isArray(script.hashtags) &&
                    script.hashtags.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Hash className="w-3 h-3 text-slate-500" />
                          {script.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] text-slate-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
