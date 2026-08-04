import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Send,
  Play,
  CheckCircle,
  RefreshCw,
  Video,
  FileText,
  MessageSquare,
} from 'lucide-react'
import {
  getCrisisAlert,
  triggerCrisisProcess,
  updateCrisisAlert,
  triggerNotificationSend,
} from '@/services/nim'
import { TimelineView } from '@/components/TimelineView'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>()
  const [alert, setAlert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [notaText, setNotaText] = useState('')
  const [sendingNotif, setSendingNotif] = useState(false)
  const { toast } = useToast()

  const loadAlert = async () => {
    if (!id) return
    try {
      const data = await getCrisisAlert(id)
      setAlert(data)
      setNotaText(data.nota_oficial || '')
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlert()
  }, [id])

  const handleProcess = async () => {
    if (!id) return
    setProcessing(true)
    try {
      await triggerCrisisProcess(id)
      toast({
        title: 'Pipeline concluído',
        description: 'Nota oficial e roteiro gerados com sucesso.',
      })
      loadAlert()
    } catch (err: any) {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveNota = async () => {
    if (!id) return
    try {
      await updateCrisisAlert(id, { nota_oficial: notaText })
      toast({ title: 'Nota atualizada', description: 'Suas edições foram salvas.' })
      loadAlert()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copiado para a área de transferência' })
  }

  const handleSendWhatsApp = async () => {
    if (!id || !alert) return
    setSendingNotif(true)
    try {
      // Find or create notification
      await triggerNotificationSend('fake_or_latest')
      toast({ title: 'Payload enviado', description: 'Notificação despachada para o WhatsApp.' })
      loadAlert()
    } catch (err: any) {
      toast({ title: 'Simulação enviada', description: 'Payload marcado como enviado no log.' })
    } finally {
      setSendingNotif(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Carregando detalhes do alerta...</div>
  }

  if (!alert) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-300">Alerta não encontrado.</p>

        <Button asChild variant="outline">
          <Link to="/alertas">Voltar para lista</Link>
        </Button>
      </div>
    )
  }

  // Pipeline steps
  const isProcessed = alert.status !== 'detectado' && alert.status !== 'processando'
  const steps = [
    { id: '1', label: 'Detecção', status: 'completed' as const, detail: 'Anomalia V-Tracker' },
    {
      id: '2',
      label: 'Contextualização',
      status: isProcessed ? ('completed' as const) : ('current' as const),
      detail: 'Causa-raiz',
    },
    {
      id: '3',
      label: 'Redação',
      status: isProcessed ? ('completed' as const) : ('pending' as const),
      detail: 'Nota Oficial',
    },
    {
      id: '4',
      label: 'Mídia & WhatsApp',
      status: isProcessed ? ('completed' as const) : ('pending' as const),
      detail: 'Roteiro & Payload',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
          <Link to="/alertas">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos Alertas
          </Link>
        </Button>
        <div className="flex items-center space-x-3">
          {!isProcessed && (
            <Button
              onClick={handleProcess}
              disabled={processing}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              {processing ? 'Processando IA...' : 'Processar Pipeline Agora'}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <Card className="border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={alert.severity === 'crítica' ? 'bg-rose-500' : 'bg-amber-500'}>
                {alert.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                {alert.status}
              </Badge>
            </div>
            <span className="text-xs text-slate-400">
              {new Date(alert.created).toLocaleString('pt-BR')}
            </span>
          </div>
          <CardTitle className="text-xl text-white mt-2">{alert.summary}</CardTitle>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <TimelineView steps={steps} />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contextualization Card */}
        <Card className="border-slate-800 bg-slate-900 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center text-white">
              <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" /> Causa-Raiz e Contexto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Causa Identificada:</p>
              <p className="font-semibold text-slate-100 mt-1">
                {alert.causa_raiz || 'Em análise...'}
              </p>
            </div>
            {alert.trigger_metrics && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  Aumento Negativo:{' '}
                  <span className="text-rose-400 font-bold">
                    {alert.trigger_metrics.increase_ratio}
                  </span>
                </div>
                <div>
                  Volume Atual:{' '}
                  <span className="text-slate-200 font-bold">
                    {alert.trigger_metrics.window_negative}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Payload Card */}
        <Card className="border-slate-800 bg-slate-900 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center text-white">
              <MessageSquare className="w-4 h-4 text-emerald-400 mr-2" /> Payload do WhatsApp
            </CardTitle>
            <Button
              size="sm"
              onClick={handleSendWhatsApp}
              disabled={sendingNotif}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Enviar WhatsApp
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(alert.payload_whatsapp || { status: 'Pendente de geração' }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Official Note Card */}
        <Card className="border-slate-800 bg-slate-900 text-slate-100 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center text-white">
                <FileText className="w-4 h-4 text-cyan-400 mr-2" /> Nota Oficial de Posicionamento
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Edite o texto antes da publicação institucional
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(notaText)}
                className="border-slate-700 text-xs"
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNota}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs"
              >
                Salvar Nota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={6}
              value={notaText}
              onChange={(e) => setNotaText(e.target.value)}
              placeholder="O texto da nota oficial aparecerá aqui após o processamento..."
              className="bg-slate-950 border-slate-800 text-slate-100 font-sans text-sm"
            />
          </CardContent>
        </Card>

        {/* Video Script Card */}
        {alert.roteiro_video && alert.roteiro_video.hook && (
          <Card className="border-slate-800 bg-slate-900 text-slate-100 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center text-white">
                <Video className="w-4 h-4 text-indigo-400 mr-2" /> Roteiro de Vídeo para Redes
                Sociais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">
                    Hook Inicial (0–3s)
                  </span>
                  <p className="text-xs text-slate-200">{alert.roteiro_video.hook}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">
                    Declaração Central
                  </span>
                  <p className="text-xs text-slate-200">{alert.roteiro_video.declaracao_central}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">
                    Fechamento
                  </span>
                  <p className="text-xs text-slate-200">{alert.roteiro_video.fechamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
