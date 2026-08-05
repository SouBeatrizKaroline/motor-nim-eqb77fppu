import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  Wand2,
  FileText,
  LayoutGrid,
  Palette,
  Calendar as CalendarIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Edit3,
  Copy,
  Share2,
  Trash2,
  Check,
  ChevronRight,
  Eye,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  MessageSquare,
  Globe,
  Film,
  Image as ImageIcon,
  AlertCircle,
  BarChart2,
  Sliders,
  Play,
  Layers,
  Search,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { CommandPalette } from '@/components/CommandPalette'
import {
  getContentStudioItems,
  updateContentStudioItem,
  updateItemStatus,
  deleteContentStudioItem,
  generateStudioContent,
  getBrandSettings,
  saveBrandSettings,
  type BrandIdentity,
  type ContentItemBriefing,
} from '@/services/content_studio'
import { getSnapshots } from '@/services/imagis'
import { getSocialTopics } from '@/services/intelligence'

// Platforms definition with icons and constraints
const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', charLimit: 2200 },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', charLimit: 3000 },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-sky-400', charLimit: 280 },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', charLimit: 5000 },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'text-emerald-500',
    charLimit: 4000,
  },
  { id: 'site', name: 'Portal Oficial', icon: Globe, color: 'text-amber-500', charLimit: 10000 },
]

// Content Types definition
const CONTENT_TYPES = [
  { id: 'comunicado', name: 'Comunicado Oficial', category: 'Texto' },
  { id: 'nota_oficial', name: 'Nota Oficial de Esclarecimento', category: 'Texto' },
  { id: 'discurso', name: 'Discurso Executivo', category: 'Texto' },
  { id: 'artigo', name: 'Artigo / Op-Ed', category: 'Texto' },
  { id: 'release', name: 'Press Release para Imprensa', category: 'Texto' },
  { id: 'carrossel', name: 'Carrossel Educativo (Slides)', category: 'Visual' },
  { id: 'infografico', name: 'Guia Visual / Infográfico', category: 'Visual' },
  { id: 'roteiro_video', name: 'Roteiro de Vídeo (Reels/TikTok)', category: 'Vídeo' },
  { id: 'newsletter', name: 'Newsletter Institucional', category: 'Texto' },
  { id: 'faq', name: 'FAQ / Perguntas Frequentes', category: 'Texto' },
]

// Status Pipeline Configuration
const PIPELINE_STAGES = [
  { id: 'draft', label: 'Rascunho' },
  { id: 'review', label: 'Em Revisão' },
  { id: 'approval', label: 'Aprovação' },
  { id: 'scheduling', label: 'Agendado' },
  { id: 'published', label: 'Publicado' },
]

export default function Estudio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()

  // Navigation active tab
  const activeTab = searchParams.get('tab') || 'generator'
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab })
  }

  // Command palette state
  const [cmdOpen, setCmdOpen] = useState(false)

  // Data State
  const [contentItems, setContentItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // Topics and Context
  const [socialTopics, setSocialTopics] = useState<any[]>([])
  const [recentSnapshots, setRecentSnapshots] = useState<any[]>([])

  // Brand Identity State
  const [brandData, setBrandIdentity] = useState<BrandIdentity>({
    organization_name: 'Governo do Estado / Mandato Executivo',
    slogan: 'Transparência, Eficiência e Compromisso com as Pessoas',
    primary_color: '#1E3A8A',
    secondary_color: '#0D9488',
    accent_color: '#F59E0B',
    tone_of_voice: 'Institucional, empático, transparente e orientador',
    prohibited_terms: ['fake news', 'ataque pessoal', 'promessa sem dados'],
    default_hashtags: ['#MandatoTransparente', '#GestaoPublica', '#AcaoEAtitude'],
  })
  const [savingBrand, setSavingBrand] = useState(false)

  // Generation Form State
  const [genContentType, setGenContentType] = useState('comunicado')
  const [genPlatform, setGenPlatform] = useState('instagram')
  const [genTopic, setGenTopic] = useState('')
  const [genTone, setGenTone] = useState('institucional')
  const [genContext, setGenContext] = useState('')
  const [genAudience, setGenAudience] = useState('')
  const [useBrand, setUseBrand] = useState(true)

  // Generation Loading State & Micro-animations
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genStepLabel, setGenStepLabel] = useState('')

  // Generated Item Result Modal or Focus View
  const [latestGenerated, setLatestGenerated] = useState<any | null>(null)

  // Review Editor State for Selected Item
  const selectedItem = useMemo(
    () => contentItems.find((i) => i.id === selectedItemId) || contentItems[0] || null,
    [contentItems, selectedItemId],
  )

  const [editDraft, setEditDraft] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [previewPlatform, setPreviewPlatform] = useState('instagram')
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  // Copy Feedback State
  const [copied, setCopied] = useState(false)

  // Load Content Items & Brand Settings
  const loadData = async () => {
    setLoadingItems(true)
    try {
      const [items, brand, topics, snaps] = await Promise.all([
        getContentStudioItems().catch(() => []),
        getBrandSettings().catch(() => null),
        getSocialTopics().catch(() => []),
        getSnapshots().catch(() => []),
      ])

      setContentItems(items)
      if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id)
      }
      if (brand) {
        setBrandIdentity(brand)
      }
      setSocialTopics(topics)
      setRecentSnapshots(snaps)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync edits when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setEditDraft(selectedItem.draft || '')
      setEditTitle(selectedItem.title || '')
    }
  }, [selectedItem])

  // Real-time subscription to keep list synchronized
  useRealtime('content_items', () => {
    getContentStudioItems()
      .then((items) => setContentItems(items))
      .catch(() => {})
  })

  // Parse briefing metadata safely
  const parseBriefing = (raw: any): ContentItemBriefing => {
    if (!raw) return {}
    if (typeof raw === 'object') return raw
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  // Handle AI Content Generation
  const handleGenerateContent = async () => {
    if (!genTopic.trim()) {
      toast({
        title: 'Campo Obrigatório',
        description: 'Por favor, insira o tema central do conteúdo.',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    setGenProgress(10)
    setGenStepLabel('Analisando escuta social e tendências vTracker...')

    const progressTimer = setInterval(() => {
      setGenProgress((prev) => {
        if (prev < 40) {
          setGenStepLabel('Cruzando diretrizes da marca e tom de voz...')
          return prev + 15
        }
        if (prev < 75) {
          setGenStepLabel('Estruturando formato multimodal e versões por rede...')
          return prev + 10
        }
        if (prev < 90) {
          setGenStepLabel('Finalizando briefing agêntico e rascunho...')
          return prev + 5
        }
        return prev
      })
    }, 600)

    try {
      const result = await generateStudioContent({
        content_type: genContentType,
        platform: genPlatform,
        topic: genTopic,
        tom_de_voz: genTone,
        contexto: genContext,
        publico_alvo: genAudience,
        use_brand: useBrand,
      })

      clearInterval(progressTimer)
      setGenProgress(100)
      setGenStepLabel('Conteúdo gerado com sucesso!')

      toast({
        title: 'Imagis: Conteúdo Criado!',
        description: `"${result.titulo}" gerado e salvo como Rascunho.`,
      })

      setLatestGenerated(result)
      await loadData()

      if (result.id) {
        setSelectedItemId(result.id)
      }

      // Switch to Review tab automatically after a brief moment
      setTimeout(() => {
        setActiveTab('review')
      }, 1200)
    } catch (err: any) {
      clearInterval(progressTimer)
      toast({
        title: 'Erro na Geração',
        description: err.message || 'Falha ao processar solicitação de IA.',
        variant: 'destructive',
      })
    } finally {
      setTimeout(() => {
        setGenerating(false)
        setGenProgress(0)
      }, 1000)
    }
  }

  // Handle Status Transitions
  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateItemStatus(itemId, newStatus)
      toast({
        title: 'Status Atualizado',
        description: `Conteúdo movido para "${PIPELINE_STAGES.find((s) => s.id === newStatus)?.label}".`,
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao Atualizar',
        description: err.message || 'Não foi possível alterar o status.',
        variant: 'destructive',
      })
    }
  }

  // Save Text Edits
  const handleSaveEdits = async () => {
    if (!selectedItem) return
    try {
      await updateContentStudioItem(selectedItem.id, {
        title: editTitle,
        draft: editDraft,
      })
      toast({
        title: 'Rascunho Salvo',
        description: 'Alterações salvas com sucesso.',
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao Salvar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Delete Content Item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteContentStudioItem(itemId)
      toast({
        title: 'Item Removido',
        description: 'Conteúdo excluído do estúdio.',
      })
      if (selectedItemId === itemId) {
        setSelectedItemId(null)
      }
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao Excluir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Save Brand Identity
  const handleSaveBrand = async () => {
    setSavingBrand(true)
    try {
      await saveBrandSettings(brandData)
      toast({
        title: 'Diretrizes Salvas',
        description:
          'Guia de Marca atualizado. A IA utilizará essas definições nas próximas gerações.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao Salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingBrand(false)
    }
  }

  // Copy Draft to Clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({ title: 'Copiado!', description: 'Texto copiado para a área de transferência.' })
    setTimeout(() => setCopied(false), 2000)
  }

  // Schedule Action
  const handleScheduleSubmit = async () => {
    if (!selectedItem || !scheduleDate) return
    try {
      await updateContentStudioItem(selectedItem.id, {
        status: 'scheduling',
        scheduled_at: new Date(scheduleDate).toISOString(),
      })
      setScheduleModalOpen(false)
      toast({
        title: 'Conteúdo Agendado',
        description: `Agendado com sucesso para ${new Date(scheduleDate).toLocaleString('pt-BR')}.`,
      })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao Agendar', description: err.message, variant: 'destructive' })
    }
  }

  // Compute Statistics
  const stats = useMemo(() => {
    const total = contentItems.length
    const drafts = contentItems.filter((i) => i.status === 'draft' || i.status === 'review').length
    const scheduled = contentItems.filter((i) => i.status === 'scheduling').length
    const published = contentItems.filter((i) => i.status === 'published').length

    let totalReach = 0
    let totalEngagement = 0
    contentItems.forEach((i) => {
      if (i.performance) {
        totalReach += i.performance.reach || 0
        totalEngagement += i.performance.engagement || 0
      }
    })

    return { total, drafts, scheduled, published, totalReach, totalEngagement }
  }, [contentItems])

  // Filtered List by Tab/Category in Review Tab
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const filteredContentItems = useMemo(() => {
    if (filterStatus === 'all') return contentItems
    return contentItems.filter((i) => i.status === filterStatus)
  }, [contentItems, filterStatus])

  // Chart Mock Performance Data for Performance Tab
  const performanceChartData = [
    { data: '27/05', alcance: 45000, engajamento: 6200 },
    { data: '28/05', alcance: 52000, engajamento: 8100 },
    { data: '29/05', alcance: 89000, engajamento: 14200 },
    { data: '30/05', alcance: 110000, engajamento: 17500 },
    { data: '31/05', alcance: 98000, engajamento: 15300 },
    { data: '01/06', alcance: 125000, engajamento: 18900 },
    { data: '02/06', alcance: 142000, engajamento: 21400 },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 uppercase tracking-wider text-[10px]">
                Núcleo Criativo Multimodal
              </Badge>
              <Badge className="bg-primary/30 text-primary-foreground border-primary/40 text-[10px]">
                IA Agêntica Imagis
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-400 animate-pulse" />
              Núcleo Criativo Imagis
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Transforme inteligência social e pautas estratégicas em textos institucionais, guias
              visuais e roteiros de vídeo de alto impacto alinhados à identidade da marca.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCmdOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md text-xs"
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Comandos (Ctrl+K)
            </Button>
            <Button
              onClick={() => setActiveTab('generator')}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 text-xs"
            >
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Gerar Conteúdo
            </Button>
          </div>
        </div>

        {/* Quick Executive KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              Rascunhos em Análise
            </span>
            <span className="text-xl font-bold text-white mt-0.5">{stats.drafts}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Agendados</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5">{stats.scheduled}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Publicados</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5">{stats.published}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              Alcance Estimado
            </span>
            <span className="text-xl font-bold text-indigo-300 mt-0.5">
              {(stats.totalReach / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 p-1 grid grid-cols-2 md:grid-cols-5 h-auto rounded-lg">
          <TabsTrigger value="generator" className="text-xs font-semibold py-2.5">
            <Wand2 className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            Gerador Multimodal
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs font-semibold py-2.5">
            <Edit3 className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
            Estúdio de Revisão
            {stats.drafts > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 px-1.5 py-0 text-[10px] bg-primary/20 text-primary"
              >
                {stats.drafts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs font-semibold py-2.5">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Calendário Editorial
          </TabsTrigger>
          <TabsTrigger value="brand" className="text-xs font-semibold py-2.5">
            <Palette className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            Identidade de Marca
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs font-semibold py-2.5">
            <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-pink-500" />
            Métricas & Performance
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: GERADOR MULTIMODAL (IA CÓRTEX) */}
        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <Card className="lg:col-span-7 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-amber-500" />
                  Geração Agêntica Multimodal
                </CardTitle>
                <CardDescription>
                  Configure os parâmetros de criação. O CÓRTEX gerará o texto, estrutura de slides,
                  roteiro de vídeo e versões por rede social.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Topic Input & Trending Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="genTopic" className="font-semibold text-xs">
                      Tema Central / Pauta Estratégica *
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Ex: Inauguração UBS, Esclarecimento de Obras
                    </span>
                  </div>
                  <Input
                    id="genTopic"
                    placeholder="Digite o assunto principal (ex: Lançamento do Programa Mais Médicos Regional)"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    className="font-medium"
                  />

                  {/* Context chips from social intelligence */}
                  {socialTopics.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] text-muted-foreground font-medium block mb-1.5">
                        Sugestões em alta da Escuta Social (clique para aplicar):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {socialTopics.slice(0, 5).map((t) => (
                          <Badge
                            key={t.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-[11px] py-0.5"
                            onClick={() => setGenTopic(t.term || '')}
                          >
                            #{t.term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Type & Primary Channel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Formato do Conteúdo</Label>
                    <Select value={genContentType} onValueChange={setGenContentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="font-medium">{t.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({t.category})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Canal Principal de Destino</Label>
                    <Select value={genPlatform} onValueChange={setGenPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => {
                          const Icon = p.icon
                          return (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${p.color}`} />
                                <span>{p.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tone of Voice & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Tom de Voz</Label>
                    <Select value={genTone} onValueChange={setGenTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="institucional">Institucional & Transparente</SelectItem>
                        <SelectItem value="empatico">Empático & Humano</SelectItem>
                        <SelectItem value="firme">Sério, Firme & Preventivo</SelectItem>
                        <SelectItem value="didatico">Didático & Orientador</SelectItem>
                        <SelectItem value="entusiasta">Entusiasta & Inspirador</SelectItem>
                        <SelectItem value="tecnico">Técnico & Especializado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Público-Alvo</Label>
                    <Input
                      placeholder="Ex: Jovens da região metropolitana, Imprensa, Lideranças"
                      value={genAudience}
                      onChange={(e) => setGenAudience(e.target.value)}
                    />
                  </div>
                </div>

                {/* Extra Context */}
                <div className="space-y-2">
                  <Label htmlFor="genContext" className="text-xs font-semibold">
                    Contexto Adicional & Dados de Apoio (Opcional)
                  </Label>
                  <Textarea
                    id="genContext"
                    rows={3}
                    placeholder="Cole fatos, valores orçamentários, prazos ou diretrizes do gabinete que devem ser incluídos na mensagem..."
                    value={genContext}
                    onChange={(e) => setGenContext(e.target.value)}
                  />
                </div>

                {/* Toggle Brand Guidelines */}
                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">
                      Aplicar Diretrizes da Marca Imagis
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Aplica cores ({brandData.primary_color}), termos proibidos e hashtages padrão
                      ({brandData.organization_name}).
                    </p>
                  </div>
                  <Switch checked={useBrand} onCheckedChange={setUseBrand} />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button
                  onClick={handleGenerateContent}
                  disabled={generating}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md w-full sm:w-auto"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Conteúdo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Conteúdo Agêntico
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Generation Progress & Preview Side Column */}
            <div className="lg:col-span-5 space-y-6">
              {generating ? (
                <Card className="border-amber-500/30 bg-amber-500/5 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-5 w-5 animate-spin" />
                      Processamento Agêntico Imagis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={genProgress} className="h-2" />
                    <p className="text-xs font-mono text-muted-foreground animate-pulse">
                      {genStepLabel}
                    </p>

                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-10 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ) : latestGenerated ? (
                <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px]">
                        Geração Concluída
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {latestGenerated.tempo_leitura || '1 min'}
                      </span>
                    </div>
                    <CardTitle className="text-base mt-2">{latestGenerated.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-muted-foreground line-clamp-3">
                      {latestGenerated.conteudo_medio || latestGenerated.conteudo_curto}
                    </p>

                    {latestGenerated.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {latestGenerated.hashtags.map((h: string, idx: number) => (
                          <span key={idx} className="text-primary font-mono text-[10px]">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t text-[11px] text-muted-foreground">
                      <strong>Estratégia:</strong> {latestGenerated.justificativa}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('review')}
                      className="w-full text-xs font-semibold"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Abrir no Estúdio de Revisão
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="bg-muted/20 border-dashed">
                  <CardHeader className="text-center py-12">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                      <Wand2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-base">Pronto para Criar</CardTitle>
                    <CardDescription className="text-xs max-w-xs mx-auto">
                      Preencha o formulário ao lado e clique em "Gerar Conteúdo". O Imagis cuidará
                      da síntese, adaptações visuais e roteiro.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {/* Brand Guidelines Quick Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-indigo-500" />
                    Diretrizes Ativas da Organização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Entidade:</span>
                    <span className="font-semibold">{brandData.organization_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tom Oficial:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {brandData.tone_of_voice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-muted-foreground">Paleta:</span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: brandData.primary_color }}
                        title="Cor Primária"
                      />
                      <div
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: brandData.secondary_color }}
                        title="Cor Secundária"
                      />
                      <div
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: brandData.accent_color }}
                        title="Cor Destaque"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: ESTÚDIO DE REVISÃO & ADAPTADOR MULTI-PLATAFORMA */}
        <TabsContent value="review" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Item List with Status Filter */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Rascunhos & Conteúdos ({filteredContentItems.length})
                </h3>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                {[{ id: 'all', label: 'Todos' }, ...PIPELINE_STAGES].map((st) => (
                  <Button
                    key={st.id}
                    variant={filterStatus === st.id ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-[11px] px-2.5 rounded-full"
                    onClick={() => setFilterStatus(st.id)}
                  >
                    {st.label}
                  </Button>
                ))}
              </div>

              {/* Items Scrollable List */}
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {loadingItems ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))
                ) : filteredContentItems.length === 0 ? (
                  <div className="p-8 text-center border rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                      Nenhum conteúdo nesta categoria.
                    </p>
                  </div>
                ) : (
                  filteredContentItems.map((item) => {
                    const isSel = selectedItem?.id === item.id
                    const briefing = parseBriefing(item.briefing)
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSel
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                            : 'bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {item.idea || item.type}
                          </Badge>
                          <Badge
                            className={`text-[10px] font-semibold ${
                              item.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : item.status === 'scheduling'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}
                          >
                            {PIPELINE_STAGES.find((s) => s.id === item.status)?.label ||
                              item.status}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                          {item.draft}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Main Editor & Preview Area */}
            <div className="lg:col-span-8">
              {selectedItem ? (
                <Card className="shadow-sm">
                  <CardHeader className="border-b pb-4">
                    {/* Pipeline Stage Tracker Stepper */}
                    <div className="flex items-center justify-between overflow-x-auto pb-3 border-b mb-4">
                      {PIPELINE_STAGES.map((st, idx) => {
                        const isCurrent = selectedItem.status === st.id
                        const isPast =
                          PIPELINE_STAGES.findIndex((s) => s.id === selectedItem.status) > idx

                        return (
                          <div key={st.id} className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(selectedItem.id, st.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                                isCurrent
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : isPast
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {isPast ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              )}
                              {st.label}
                            </button>
                            {idx < PIPELINE_STAGES.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-base font-bold h-9 border-transparent hover:border-input focus:border-input px-0 font-sans"
                        />
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Criado em: {new Date(selectedItem.created).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyText(editDraft)}
                          className="h-8 text-xs"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1" />
                          )}
                          Copiar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setScheduleModalOpen(true)}
                          className="h-8 text-xs"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          Agendar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdits}
                          className="h-8 text-xs font-semibold"
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Multimodal Preview & Adaptation Tabs */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Preview & Adaptação Agêntica por Rede
                        </Label>
                        <div className="flex gap-1">
                          {PLATFORMS.map((p) => {
                            const Icon = p.icon
                            const isSel = previewPlatform === p.id
                            return (
                              <Button
                                key={p.id}
                                variant={isSel ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-[11px] px-2"
                                onClick={() => setPreviewPlatform(p.id)}
                              >
                                <Icon
                                  className={`h-3.5 w-3.5 mr-1 ${isSel ? 'text-white' : p.color}`}
                                />
                                {p.name}
                              </Button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Live Platform Preview Box */}
                      {(() => {
                        const briefing = parseBriefing(selectedItem.briefing)
                        const adaptationText =
                          briefing.adaptations?.[previewPlatform] ||
                          briefing.conteudo_medio ||
                          editDraft

                        const currentPlatformInfo = PLATFORMS.find((p) => p.id === previewPlatform)
                        const charCount = adaptationText.length
                        const limit = currentPlatformInfo?.charLimit || 2000
                        const isOverLimit = charCount > limit

                        return (
                          <div className="border rounded-xl p-4 bg-slate-950 text-slate-100 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                                  {brandData.organization_name?.slice(0, 2).toUpperCase() || 'GOV'}
                                </div>
                                <div>
                                  <span className="text-xs font-bold block">
                                    {brandData.organization_name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Oficial • Há 2 min
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono ${
                                  isOverLimit
                                    ? 'border-red-500 text-red-400'
                                    : 'border-slate-700 text-slate-400'
                                }`}
                              >
                                {charCount} / {limit} caracteres
                              </Badge>
                            </div>

                            {/* Carousel Slide Special Renderer */}
                            {briefing.slides && briefing.slides.length > 0 ? (
                              <div className="space-y-3">
                                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                                  <Layers className="h-3.5 w-3.5" />
                                  Estrutura de Carrossel ({briefing.slides.length} Slides)
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {briefing.slides.map((s, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1.5"
                                    >
                                      <span className="text-[10px] font-mono text-amber-400">
                                        Slide {s.slide}
                                      </span>
                                      <h5 className="text-xs font-bold text-white">{s.titulo}</h5>
                                      <p className="text-[11px] text-slate-300">{s.texto}</p>
                                      {s.imagem_sugestao && (
                                        <div className="mt-2 p-1.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
                                          📷 <strong>Guia Visual:</strong> {s.imagem_sugestao}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : briefing.video_storyboard &&
                              briefing.video_storyboard.length > 0 ? (
                              /* Video Storyboard Special Renderer */
                              <div className="space-y-3">
                                <div className="text-xs font-semibold text-pink-400 flex items-center gap-1">
                                  <Film className="h-3.5 w-3.5" />
                                  Storyboard de Roteiro de Vídeo ({
                                    briefing.video_storyboard.length
                                  }{' '}
                                  Cenas)
                                </div>
                                <div className="space-y-2">
                                  {briefing.video_storyboard.map((c, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1"
                                    >
                                      <div className="flex items-center justify-between text-[10px] font-mono text-pink-400">
                                        <span>
                                          Cena {c.cena} ({c.tempo || '0-5s'})
                                        </span>
                                        <span>{c.enquadramento}</span>
                                      </div>
                                      <p className="text-xs font-medium text-white">
                                        🎙️ "{c.audio}"
                                      </p>
                                      {c.legenda && (
                                        <p className="text-[10px] font-bold text-amber-300">
                                          📺 Legenda Tela: {c.legenda}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              /* Standard Text Post Preview */
                              <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                                {adaptationText}
                              </p>
                            )}

                            {/* Hashtags & CTA Footer */}
                            {briefing.hashtags && briefing.hashtags.length > 0 && (
                              <div className="pt-2 text-[11px] text-primary flex flex-wrap gap-1 font-mono">
                                {briefing.hashtags.map((h, hIdx) => (
                                  <span key={hIdx}>{h}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Direct Text Draft Editor */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Edição Direta do Texto Base
                      </Label>
                      <Textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={6}
                        className="font-mono text-xs leading-relaxed"
                      />
                    </div>

                    {/* AI Transparency & Justification Box */}
                    {(() => {
                      const briefing = parseBriefing(selectedItem.briefing)
                      return (
                        <div className="rounded-lg border p-4 bg-muted/30 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                            <Sparkles className="h-4 w-4" />
                            Transparência & Racional Estratégico da IA
                          </div>
                          <p className="text-muted-foreground">
                            {briefing.justificativa ||
                              'Conteúdo otimizado com base na análise de engajamento do mandato e demandas da opinião pública.'}
                          </p>

                          {briefing.palavras_chave && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="font-semibold text-[11px]">Palavras-chave:</span>
                              <div className="flex flex-wrap gap-1">
                                {briefing.palavras_chave.map((kw, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px]">
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </CardContent>

                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(selectedItem.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Excluir
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(selectedItem.id, 'review')}
                      >
                        Mover p/ Revisão
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(selectedItem.id, 'approval')}
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Aprovar Conteúdo
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <div className="border rounded-xl p-12 text-center bg-card">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-bold text-sm">Nenhum conteúdo selecionado</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione um item da lista à esquerda ou gere um novo rascunho na aba "Gerador
                    Multimodal".
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: CALENDÁRIO EDITORIAL */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-500" />
                Planejamento & Calendário Editorial
              </CardTitle>
              <CardDescription>
                Visualize as datas de publicação agendadas, distribuição de frequência e mantenha a
                consistência da comunicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calendar Grid Representation */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b pb-2">
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[320px]">
                {Array.from({ length: 14 }).map((_, dayIdx) => {
                  const dayNum = dayIdx + 1
                  const dayItems = contentItems.filter((i) => {
                    if (!i.scheduled_at && !i.published_at) return false
                    const d = new Date(i.scheduled_at || i.published_at)
                    return d.getDate() === dayNum
                  })

                  return (
                    <div
                      key={dayIdx}
                      className="border rounded-lg p-2 min-h-[80px] bg-card hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground block mb-1">
                        Dia {dayNum}
                      </span>

                      <div className="space-y-1">
                        {dayItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedItemId(item.id)
                              setActiveTab('review')
                            }}
                            className="p-1 rounded bg-primary/10 text-[10px] text-primary font-medium truncate cursor-pointer hover:underline"
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: IDENTIDADE DE MARCA (BRAND HUB) */}
        <TabsContent value="brand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-500" />
                Guia da Marca & Diretrizes Institucionais Imagis
              </CardTitle>
              <CardDescription>
                Defina as cores oficiais, slogan, diretrizes de tom de voz e termos restritos. O
                motor da IA usará essas diretrizes para manter consistência automática.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Nome da Organização / Mandato</Label>
                  <Input
                    value={brandData.organization_name || ''}
                    onChange={(e) =>
                      setBrandIdentity((prev) => ({ ...prev, organization_name: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Slogan Oficial</Label>
                  <Input
                    value={brandData.slogan || ''}
                    onChange={(e) =>
                      setBrandIdentity((prev) => ({ ...prev, slogan: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Colors Customizer */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Paleta de Cores da Marca
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium">Cor Primária</span>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={brandData.primary_color || '#1E3A8A'}
                        onChange={(e) =>
                          setBrandIdentity((prev) => ({ ...prev, primary_color: e.target.value }))
                        }
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandData.primary_color || ''}
                        onChange={(e) =>
                          setBrandIdentity((prev) => ({ ...prev, primary_color: e.target.value }))
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-medium">Cor Secundária</span>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={brandData.secondary_color || '#0D9488'}
                        onChange={(e) =>
                          setBrandIdentity((prev) => ({ ...prev, secondary_color: e.target.value }))
                        }
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandData.secondary_color || ''}
                        onChange={(e) =>
                          setBrandIdentity((prev) => ({ ...prev, secondary_color: e.target.value }))
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-medium">Cor de Destaque</span>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={brandData.accent_color || '#F59E0B'}
                        onChange={(e) =>
                          setBrandIdentity((prev) => ({ ...prev, accent_color: e.target.value }))
                        }
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandData.accent_color || ''}
                        onChange={(e) =>
                          setBrandIdentity((prev) => ({ ...prev, accent_color: e.target.value }))
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tone of Voice Guidelines */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tom de Voz Institucional Padrão</Label>
                <Textarea
                  rows={3}
                  value={brandData.tone_of_voice || ''}
                  onChange={(e) =>
                    setBrandIdentity((prev) => ({ ...prev, tone_of_voice: e.target.value }))
                  }
                  placeholder="Ex: Tom solene porém acessível, focado em prestação de contas com linguagem direta sem jargões jurídicos excessivos..."
                />
              </div>

              {/* Prohibited Terms & Default Hashtags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Termos / Palavras Proibidas (separadas por vírgula)
                  </Label>
                  <Input
                    value={brandData.prohibited_terms?.join(', ') || ''}
                    onChange={(e) =>
                      setBrandIdentity((prev) => ({
                        ...prev,
                        prohibited_terms: e.target.value.split(',').map((s) => s.trim()),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Hashtags Padrão (separadas por vírgula)
                  </Label>
                  <Input
                    value={brandData.default_hashtags?.join(', ') || ''}
                    onChange={(e) =>
                      setBrandIdentity((prev) => ({
                        ...prev,
                        default_hashtags: e.target.value.split(',').map((s) => s.trim()),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-end">
              <Button
                onClick={handleSaveBrand}
                disabled={savingBrand}
                className="bg-indigo-600 hover:bg-indigo-700 font-semibold"
              >
                {savingBrand ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Salvar Diretrizes de Marca
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB 5: DESEMPENHO & MÉTRICAS */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Alcance Total Acumulado</CardDescription>
                <CardTitle className="text-2xl font-bold">125.7K</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-emerald-500 font-medium">↑ +34% este mês</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Engajamento Médio</CardDescription>
                <CardTitle className="text-2xl font-bold">18.9K</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-emerald-500 font-medium">↑ +27% interações</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Taxa de Cliques (CTR)</CardDescription>
                <CardTitle className="text-2xl font-bold">4.8%</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-indigo-400 font-medium">Acima da média do setor</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                Evolução de Alcance e Engajamento dos Conteúdos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="data" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="alcance"
                      stroke="#1E3A8A"
                      fill="#1E3A8A"
                      fillOpacity={0.2}
                      name="Alcance"
                    />
                    <Area
                      type="monotone"
                      dataKey="engajamento"
                      stroke="#0D9488"
                      fill="#0D9488"
                      fillOpacity={0.3}
                      name="Engajamento"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Publicação</DialogTitle>
            <DialogDescription>
              Escolha a data e o horário para o disparo agendado do conteúdo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Data e Hora de Publicação</Label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleSubmit} className="bg-amber-600 hover:bg-amber-700">
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Command Palette */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  )
}
