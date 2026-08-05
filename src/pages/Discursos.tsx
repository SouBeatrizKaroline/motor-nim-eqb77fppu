import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, Clock, Sparkles, Copy, Check } from 'lucide-react'
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
import { getSpeeches, deleteSpeech, triggerSpeechGenerate } from '@/services/imagis'

export default function Discursos() {
  const { toast } = useToast()
  const [speeches, setSpeeches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [tema, setTema] = useState('')
  const [tomDeVoz, setTomDeVoz] = useState('institucional')
  const [duracao, setDuracao] = useState('5')
  const [pautas, setPautas] = useState('')

  const loadSpeeches = async () => {
    try {
      const data = await getSpeeches()
      setSpeeches(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpeeches()
  }, [])

  useRealtime('speeches', () => loadSpeeches())

  const handleGenerate = async () => {
    if (!tema.trim()) {
      toast({
        title: 'Informe o tema',
        description: 'O tema é obrigatório para gerar o discurso.',
        variant: 'destructive',
      })
      return
    }
    setGenerating(true)
    try {
      const pautasArray = pautas
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)

      await triggerSpeechGenerate({
        tema: tema.trim(),
        tom_de_voz: tomDeVoz,
        duracao_minutos: parseInt(duracao, 10) || 5,
        pautas: pautasArray,
      })
      toast({
        title: 'Discurso gerado!',
        description: 'O discurso foi criado e salvo com sucesso.',
      })
      setTema('')
      setPautas('')
      loadSpeeches()
    } catch (err: any) {
      toast({ title: 'Erro ao gerar discurso', description: err.message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSpeech(id)
      toast({ title: 'Discurso removido' })
      loadSpeeches()
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Form */}
        <Card className="border-slate-800 bg-slate-900/80 text-slate-100 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-base font-bold text-white">Novo Discurso</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Configure os parâmetros e gere um discurso de plenário com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tema" className="text-xs text-slate-300">
                Tema Principal
              </Label>
              <Input
                id="tema"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Saúde pública no município"
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
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="combativo">Combativo</SelectItem>
                  <SelectItem value="conciliador">Conciliador</SelectItem>
                  <SelectItem value="emocional">Emocional</SelectItem>
                  <SelectItem value="técnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao" className="text-xs text-slate-300">
                Duração (minutos)
              </Label>
              <Input
                id="duracao"
                type="number"
                min="1"
                max="30"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pautas" className="text-xs text-slate-300">
                Pautas (uma por linha)
              </Label>
              <Textarea
                id="pautas"
                value={pautas}
                onChange={(e) => setPautas(e.target.value)}
                placeholder={'Ex:\nFalta de médicos\nFilas nas UBS\nInvestimento em infraestrutura'}
                className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 min-h-[100px]"
              />
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
                  Gerar Discurso
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Speeches List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Discursos Gerados</h3>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {speeches.length} registro(s)
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
          ) : speeches.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">Nenhum discurso gerado ainda.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Use o formulário ao lado para criar o primeiro.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {speeches.map((speech) => (
                <Card key={speech.id} className="border-slate-800 bg-slate-900/80 text-slate-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-bold text-white truncate">
                          {speech.title || speech.tema || 'Discurso sem título'}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {speech.tom_de_voz && (
                            <Badge
                              variant="outline"
                              className="border-cyan-500/30 text-cyan-400 text-[10px]"
                            >
                              {speech.tom_de_voz}
                            </Badge>
                          )}
                          {speech.duracao_minutos && (
                            <span className="flex items-center text-[11px] text-slate-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {speech.duracao_minutos} min
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {new Date(speech.created).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                          onClick={() => handleCopy(speech.id, speech.content || '')}
                          title="Copiar conteúdo"
                        >
                          {copiedId === speech.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => handleDelete(speech.id)}
                          title="Excluir discurso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {speech.content && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6 leading-relaxed">
                        {speech.content}
                      </p>
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
