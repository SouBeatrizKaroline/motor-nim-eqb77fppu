import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Users,
  Eye,
  Heart,
  Share2,
  Film,
  MousePointerClick,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getAudienceSnapshots,
  getReputationScores,
  getSocialTopics,
  triggerReputationCalc,
} from '@/services/intelligence'

export default function Inteligencia() {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calcLoading, setCalcLoading] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [snap, sc, tp] = await Promise.all([
        getAudienceSnapshots(),
        getReputationScores(),
        getSocialTopics(),
      ])
      setSnapshots(snap || [])
      setScores(sc || [])
      setTopics(tp || [])
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('audience_snapshots', () => loadData())
  useRealtime('reputation_scores', () => loadData())

  const handleCalc = async () => {
    setCalcLoading(true)
    try {
      await triggerReputationCalc()
      toast({ title: 'PRS recalculado', description: 'Score de reputação atualizado.' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setCalcLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando...</div>

  const latest = snapshots[0]
  const latestScore = scores[0]

  const chartData = snapshots
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      followers: s.followers,
      reach: s.reach,
      engagement: s.engagement,
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Inteligência de Marketing Político</h2>
        <Button
          onClick={handleCalc}
          disabled={calcLoading}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${calcLoading ? 'animate-spin' : ''}`} /> Recalcular
          PRS
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Seguidores"
          value={(latest?.followers || 0).toLocaleString('pt-BR')}
          icon={<Users className="w-5 h-5" />}
          trend="+8%"
          trendUp
        />
        <KpiCard
          title="Reach"
          value={(latest?.reach || 0).toLocaleString('pt-BR')}
          icon={<Eye className="w-5 h-5" />}
          trend="+12%"
          trendUp
        />
        <KpiCard
          title="Engajamento"
          value={`${latest?.engagement_rate?.toFixed(1) || 0}%`}
          icon={<Heart className="w-5 h-5" />}
        />
        <KpiCard
          title="PRS Score"
          value={latestScore?.prs_score || 'N/A'}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={latestScore ? 'Atualizado' : 'Pendente'}
          trendUp={!!latestScore}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Compartilhamentos"
          value={latest?.shares || 0}
          icon={<Share2 className="w-5 h-5" />}
        />
        <KpiCard
          title="Taxa de Conclusão"
          value={`${latest?.video_completion_rate || 0}%`}
          icon={<Film className="w-5 h-5" />}
        />
        <KpiCard
          title="CTR"
          value={`${latest?.ctr?.toFixed(1) || 0}%`}
          icon={<MousePointerClick className="w-5 h-5" />}
        />
        <KpiCard
          title="Sentimento"
          value={latest?.sentiment?.toFixed(2) || '0.00'}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={latest?.sentiment < 0 ? 'Negativo' : 'Positivo'}
          trendUp={latest?.sentiment >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/80 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base text-white">Evolução de Audiência</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
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
                  dataKey="followers"
                  name="Seguidores"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base text-white">Tópicos Associados</CardTitle>
            <CardDescription className="text-xs text-slate-400">Termos monitorados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {topics
              .filter((t: any) => t.active)
              .slice(0, 10)
              .map((t: any) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800"
                >
                  <span className="text-xs text-slate-200">{t.term}</span>
                  <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                    {t.type}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
