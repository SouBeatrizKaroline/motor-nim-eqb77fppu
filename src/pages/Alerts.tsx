import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Filter, Play, CheckCircle2, Clock, Send, Eye } from 'lucide-react'
import { getCrisisAlerts, triggerCrisisProcess } from '@/services/imagis'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('todos')
  const [severityFilter, setSeverityFilter] = useState('todos')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadAlerts = async () => {
    try {
      const data = await getCrisisAlerts()
      setAlerts(data || [])
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  useRealtime('crisis_alerts', () => loadAlerts())

  const handleProcess = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setProcessingId(id)
    try {
      await triggerCrisisProcess(id)
      toast({
        title: 'Pipeline executado',
        description: 'Nota e respostas de mídia geradas com sucesso.',
      })
      loadAlerts()
    } catch (err: any) {
      toast({ title: 'Erro na execução', description: err.message, variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter !== 'todos' && a.status !== statusFilter) return false
    if (severityFilter !== 'todos' && a.severity !== severityFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Central de Alertas de Crise</h2>
            <p className="text-xs text-slate-400">
              Monitoramento e automação de resposta em tempo real
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 bg-slate-950 border-slate-800 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="detectado">Detectado</SelectItem>
              <SelectItem value="nota_pronta">Nota Pronta</SelectItem>
              <SelectItem value="notificado">Notificado</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36 h-9 bg-slate-950 border-slate-800 text-xs">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="todos">Todas Severidades</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="média">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="crítica">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900 text-slate-100 text-center py-12">
            <CardContent>
              <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhum alerta encontrado</p>
              <p className="text-xs text-slate-500">
                Altere os filtros acima para visualizar os registros.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all text-slate-100"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <Badge
                      className={
                        alert.severity === 'crítica'
                          ? 'bg-rose-500 text-white'
                          : alert.severity === 'alta'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="border-slate-700 text-slate-300 text-xs capitalize"
                    >
                      {alert.status.replace('_', ' ')}
                    </Badge>

                    <span className="text-[11px] text-slate-500">
                      {new Date(alert.created).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{alert.summary}</h3>

                  {alert.trigger_metrics && (
                    <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                      <span>
                        Volume:{' '}
                        <strong className="text-slate-200">
                          {alert.trigger_metrics.window_negative}
                        </strong>
                      </span>
                      <span>
                        Anomalia:{' '}
                        <strong className="text-rose-400">
                          {alert.trigger_metrics.increase_ratio}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {alert.status === 'detectado' && (
                    <Button
                      onClick={(e) => handleProcess(alert.id, e)}
                      disabled={processingId === alert.id}
                      className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      {processingId === alert.id ? 'Processando...' : 'Processar Pipeline'}
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
                  >
                    <Link to={`/alertas/${alert.id}`}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
