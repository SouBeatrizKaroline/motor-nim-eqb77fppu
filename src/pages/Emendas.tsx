import { useState, useEffect } from 'react'
import { Coins, Search, FileText, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getDemands,
  getBudgetItems,
  getAmendmentReports,
  triggerAmendmentAnalyze,
} from '@/services/nim'

export default function Emendas() {
  const { toast } = useToast()
  const [demands, setDemands] = useState<any[]>([])
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [query, setQuery] = useState('')

  const loadData = async () => {
    try {
      const [demandsRes, budgetRes, reportsRes] = await Promise.all([
        getDemands(),
        getBudgetItems(),
        getAmendmentReports(),
      ])
      setDemands(demandsRes || [])
      setBudgetItems(budgetRes || [])
      setReports(reportsRes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('demands', () => loadData())
  useRealtime('budget_items', () => loadData())
  useRealtime('amendment_reports', () => loadData())

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast({
        title: 'Informe uma demanda',
        description: 'Descreva a demanda para buscar rubricas compatíveis.',
        variant: 'destructive',
      })
      return
    }
    setAnalyzing(true)
    try {
      const result: any = await triggerAmendmentAnalyze({ query: query.trim() })
      toast({
        title: 'Análise concluída!',
        description: result.report_created
          ? 'Relatório de emenda gerado com sucesso.'
          : 'Matching executado. Verifique os resultados.',
      })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro na análise',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/80 text-slate-100 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-base font-bold text-white">Matching de Emendas</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Descreva uma demanda social e a IA fará o matching semântico com rubricas
              orçamentárias disponíveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query" className="text-xs text-slate-300">
                Descrição da Demanda
              </Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: A comunidade do bairro Vila Nova reclama da falta de iluminação pública nas ruas principais..."
                className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 min-h-[120px]"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Executar Matching
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Demandas Cadastradas</h3>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {demands.length} registro(s)
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : demands.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Coins className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">Nenhuma demanda registrada.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Execute o pipeline de emendas para gerar demandas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {demands.slice(0, 5).map((d) => (
                <Card key={d.id} className="border-slate-800 bg-slate-900/80 text-slate-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">
                          {d.title || 'Demanda sem título'}
                        </p>
                        {d.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {d.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {d.category && (
                            <Badge
                              variant="outline"
                              className="border-cyan-500/30 text-cyan-400 text-[10px]"
                            >
                              {d.category}
                            </Badge>
                          )}
                          {d.negative_volume > 0 && (
                            <span className="flex items-center text-[11px] text-rose-400">
                              <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                              {d.negative_volume} negativas
                            </span>
                          )}
                          {d.region && (
                            <span className="text-[11px] text-slate-500">{d.region}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {reports.length > 0 && (
            <>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Relatórios de Emenda</h3>
                </div>
                <Badge variant="outline" className="border-slate-700 text-slate-300">
                  {reports.length} relatório(s)
                </Badge>
              </div>
              <div className="space-y-3">
                {reports.slice(0, 3).map((r) => (
                  <Card key={r.id} className="border-slate-800 bg-slate-900/80 text-slate-100">
                    <CardContent className="p-4">
                      <p className="text-sm font-bold text-white">
                        {r.title || 'Relatório sem título'}
                      </p>
                      {r.summary && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-3">{r.summary}</p>
                      )}
                      <p className="text-[11px] text-slate-500 mt-2">
                        {new Date(r.created).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
