import { useState, useEffect } from 'react'
import { Settings, Save, Loader2, Bell, Globe, Shield, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getSettingsRecord, saveSettingsRecord } from '@/services/nim'

export default function Configuracoes() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [crisisThreshold, setCrisisThreshold] = useState('media')
  const [autoNotify, setAutoNotify] = useState(true)
  const [autoGenerateScript, setAutoGenerateScript] = useState(false)
  const [monitoringWindow, setMonitoringWindow] = useState('60')

  const loadSettings = async () => {
    try {
      const record = await getSettingsRecord()
      if (record?.value) {
        const val = typeof record.value === 'string' ? JSON.parse(record.value) : record.value
        setWhatsappNumber(val.whatsappNumber || '')
        setWebhookUrl(val.webhookUrl || '')
        setCrisisThreshold(val.crisisThreshold || 'media')
        setAutoNotify(val.autoNotify ?? true)
        setAutoGenerateScript(val.autoGenerateScript ?? false)
        setMonitoringWindow(val.monitoringWindow || '60')
      }
    } catch {
      /* no settings yet */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        whatsappNumber,
        webhookUrl,
        crisisThreshold,
        autoNotify,
        autoGenerateScript,
        monitoringWindow,
      }
      await saveSettingsRecord(payload)
      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-base font-bold text-white">Notificações</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Configure os canais de notificação para alertas de crise e respostas automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-300">Número do WhatsApp</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="bg-slate-950/60 border-slate-800 text-slate-100"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div>
              <p className="text-sm font-medium text-slate-100">Notificação automática de crises</p>
              <p className="text-xs text-slate-400">
                Envia alertas via WhatsApp ao detectar uma crise.
              </p>
            </div>
            <Switch checked={autoNotify} onCheckedChange={setAutoNotify} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div>
              <p className="text-sm font-medium text-slate-100">Gerar roteiro automático</p>
              <p className="text-xs text-slate-400">
                Cria roteiro de vídeo automaticamente após nota oficial.
              </p>
            </div>
            <Switch checked={autoGenerateScript} onCheckedChange={setAutoGenerateScript} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-base font-bold text-white">Detecção de Crise</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Ajuste a sensibilidade e a janela de monitoramento do pipeline de crises.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-300">Severidade mínima para alerta</Label>
            <Select value={crisisThreshold} onValueChange={setCrisisThreshold}>
              <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="média">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="crítica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-300">Janela de monitoramento (minutos)</Label>
            <Input
              type="number"
              value={monitoringWindow}
              onChange={(e) => setMonitoringWindow(e.target.value)}
              className="bg-slate-950/60 border-slate-800 text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80 text-slate-100">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-base font-bold text-white">Integrações</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Configure webhooks e integrações externas do NIM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-300">URL do Webhook</Label>
            <Textarea
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://exemplo.com/webhook/nim"
              className="bg-slate-950/60 border-slate-800 text-slate-100 min-h-[60px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-cyan-500/20"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
