import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  MessageSquare,
  Zap,
  TrendingDown,
  TrendingUp,
  FileText,
  Video,
  Coins,
  RefreshCcw,
  ArrowRight,
  Flame,
  CheckCircle,
  XCircle,
  Play,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/hooks/use-auth'
import { KpiCard } from '@/components/KpiCard'
import { TermChip } from '@/components/TermChip'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSnapshots,
  getCrisisAlerts,
  getPipelineRuns,
  triggerVTrackerIngest,
  triggerCrisisDetect,
} from '@/services/nim'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [snapshots, setSnapshots] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [pipelineRuns, setPipelineRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState(false)

  const loadDashboardData = async () => {
    try {
      const [snapRes, alertsRes, runsRes] = await Promise.all([
        getSnapshots(),
        getCrisisAlerts(),
        getPipelineRuns(),
      ])
      setSnapshots(snapRes.items || [])
      setAlerts(alertsRes || [])
      setPipelineRuns(runsRes.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useRealtime('vtracker_snapshots', () => loadDashboardData())
  useRealtime('crisis_alerts', () => loadDashboardData())
  useRealtime('pipeline_runs', () => loadDashboardData())

  const handleIngestAndDetect = async () => {
    setIngesting(true)
    try {
      await triggerVTrackerIngest()
      const detectRes: any = await triggerCrisisDetect()
      toast({
        title: 'Dados sincronizados',
        description: detectRes.alert_created
          ? 'Anomalia identificada! Novo alerta de crise gerado.'
          : 'Escuta social atualizada. Nenhuma crise detectada.',
      })
      loadDashboardData()
    } catch (err: any) {
      toast({ title: 'Erro ao sincronizar', description: err.message, variant: 'destructive' })
    } finally {
      setIngesting(false)
    }
  }

  // Calculate Metrics
  const latestSnap = snapshots[0]
  const mentionsVolume = latestSnap?.mention_volume || 1280
  const polarityIndex = latestSnap?.polarity_index ?? -0.25
  const activeAlerts = alerts.filter((a) => a.status !== 'resolvido' && a.status !== 'descartado')
  const successfulRuns = pipelineRuns.filter((r) => r.status === 'sucesso').length
  const successRate =
    pipelineRuns.length > 0 ? Math.round((successfulRuns / pipelineRuns.length) * 100) : 100

  // Chart Data
  const chartData = snapshots
    .slice()
    .reverse()
    .map((s) => ({
      time: new Date(s.created).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      mençoes: s.mention_volume,
      polaridade: Math.round((s.polarity_index + 1) * 50),
    }))

  const emergingTerms = latestSnap?.emerging_terms || [
    { term: 'falta de médico', delta: 3.5, mentions: 340 },
    { term: 'filas ubs', delta: 2.8, mentions: 290 },
    { term: 'cratera asfalto', delta: 2.1, mentions: 180 },
  ]

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            SALA DE COMANDO PARLAMENTAR
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            Olá, {user?.name || 'Assessor'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 capitalize">{todayFormatted}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleIngestAndDetect}
            disabled={ingesting}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${ingesting ? 'animate-spin' : ''}`} />
            Sincronizar V-Tracker
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Menções (24h)"
          value={mentionsVolume.toLocaleString('pt-BR')}
          subtext="vs. janela anterior"
          trend="+18%"
          trendUp={true}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <KpiCard
          title="Índice de Polaridade"
          value={polarityIndex > 0 ? `+${polarityIndex}` : `${polarityIndex}`}
          subtext={polarityIndex < 0 ? 'Sentimento Negativo' : 'Sentimento Positivo'}
          trend={polarityIndex < 0 ? 'Atenção' : 'Estável'}
          trendUp={polarityIndex >= 0}
          icon={
            polarityIndex < 0 ? (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            )
          }
        />
        <KpiCard
          title="Alertas Ativos"
          value={activeAlerts.length}
          subtext="Necessitam posicionamento"
          trend={activeAlerts.length > 0 ? 'Crítico' : 'Normal'}
          trendUp={activeAlerts.length === 0}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          gradient={activeAlerts.length > 0 ? 'border-rose-500/30' : ''}
        />
        <KpiCard
          title="Pipelines Executados"
          value={`${pipelineRuns.length}`}
          subtext={`${successRate}% taxa de sucesso`}
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
        />
      </div>

      {/* Main Charts & Terms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Social Listening Chart */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/80 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white">
                Evolução de Escuta Social
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Volume de menções e índice de sentimento nos últimos dias
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
              V-Tracker API
            </Badge>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMencoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mençoes"
                  name="Menções"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMencoes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emerging Terms */}
        <Card className="border-slate-800 bg-slate-900/80 text-slate-100 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <CardTitle className="text-base font-bold text-white">Termos Emergentes</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Pautas com maior aceleração negativa recente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
            {emergingTerms.map((t: any, idx: number) => (
              <TermChip
                key={idx}
                rank={idx + 1}
                term={t.term}
                delta={t.delta}
                mentions={t.mentions}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Grid */}
        <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Ações Rápidas de IA</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Dispare os pipelines automatizados do mandato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate('/discursos')}
              variant="outline"
              className="w-full justify-between bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold">Gerar Discurso de Plenário</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Button>

            <Button
              onClick={() => navigate('/roteiros')}
              variant="outline"
              className="w-full justify-between bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200"
            >
              <div className="flex items-center space-x-3">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold">Criar Roteiro Reels/TikTok</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Button>

            <Button
              onClick={() => navigate('/emendas')}
              variant="outline"
              className="w-full justify-between bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200"
            >
              <div className="flex items-center space-x-3">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold">Matching de Emendas</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Alerts List */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/80 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-white">
                Alertas de Crise Recentes
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Situações de emergência e respostas geradas
              </CardDescription>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              <Link to="/alertas">Ver todos ({alerts.length})</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Nenhum alerta de crise registrado.
              </p>
            ) : (
              alerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          a.severity === 'crítica' || a.severity === 'alta'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400'
                        }
                      >
                        {a.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {a.summary}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {new Date(a.created).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs shrink-0"
                  >
                    <Link to={`/alertas/${a.id}`}>Ver Alerta</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
