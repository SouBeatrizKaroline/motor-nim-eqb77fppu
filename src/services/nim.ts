import pb from '@/lib/pocketbase/client'

export interface Settings {
  vtracker_url?: string
  vtracker_api_key?: string
  vtracker_enabled?: boolean
  whatsapp_provider?: string
  whatsapp_webhook_url?: string
  whatsapp_api_token?: string
  default_target_phone?: string
  threshold_window_minutes?: number
  threshold_baseline_hours?: number
  threshold_multiplier?: number
  threshold_min_negative?: number
  threshold_polarity_drop?: number
  auto_process?: boolean
  auto_notify?: boolean
  speech_system_prompt?: string
  script_system_prompt?: string
}

export const getSnapshots = () =>
  pb.collection('vtracker_snapshots').getList(1, 20, { sort: '-created' })
export const getCrisisAlerts = () =>
  pb.collection('crisis_alerts').getFullList({ sort: '-created' })
export const getCrisisAlert = (id: string) => pb.collection('crisis_alerts').getOne(id)
export const updateCrisisAlert = (id: string, data: any) =>
  pb.collection('crisis_alerts').update(id, data)

export const getSpeeches = () => pb.collection('speeches').getFullList({ sort: '-created' })
export const deleteSpeech = (id: string) => pb.collection('speeches').delete(id)

export const getRetentionScripts = () =>
  pb.collection('retention_scripts').getFullList({ sort: '-created' })
export const deleteRetentionScript = (id: string) => pb.collection('retention_scripts').delete(id)

export const getDemands = () => pb.collection('demands').getFullList({ sort: '-negative_volume' })
export const getBudgetItems = () => pb.collection('budget_items').getFullList({ sort: 'code' })
export const getAmendmentReports = () =>
  pb.collection('amendment_reports').getFullList({ sort: '-created' })

export const getPipelineRuns = () =>
  pb.collection('pipeline_runs').getList(1, 15, { sort: '-created' })
export const getNotifications = () =>
  pb.collection('notifications').getList(1, 10, { sort: '-created' })

export const getSettingsRecord = async () => {
  try {
    return await pb.collection('settings').getFirstListItem('key="motor_nim"')
  } catch (_) {
    return null
  }
}

export const saveSettingsRecord = async (value: Settings) => {
  const existing = await getSettingsRecord()
  if (existing) {
    return pb.collection('settings').update(existing.id, { value })
  }
  return pb.collection('settings').create({ key: 'motor_nim', value })
}

// Custom route triggers
export const triggerVTrackerIngest = (manual = false, data?: any) =>
  pb.send('/backend/v1/vtracker/ingest', {
    method: 'POST',
    body: JSON.stringify({ manual, ...data }),
    headers: { 'Content-Type': 'application/json' },
  })

export const triggerCrisisDetect = () => pb.send('/backend/v1/crisis/detect', { method: 'POST' })

export const triggerCrisisProcess = (alertId: string) =>
  pb.send(`/backend/v1/crisis/${alertId}/process`, { method: 'POST' })

export const triggerSpeechGenerate = (data: {
  tema: string
  tom_de_voz: string
  duracao_minutos: number
  pautas: string[]
  contexto?: string
}) =>
  pb.send('/backend/v1/speeches/generate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const triggerScriptGenerate = (data: {
  plataforma: string
  tipo_conteudo: string
  tema: string
  tom_de_voz: string
}) =>
  pb.send('/backend/v1/scripts/generate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const triggerAmendmentAnalyze = () =>
  pb.send('/backend/v1/amendments/analyze', { method: 'POST' })

export const triggerNotificationSend = (notificationId: string) =>
  pb.send(`/backend/v1/notifications/${notificationId}/send`, { method: 'POST' })

export const askNimAgent = (message: string, conversationId?: string | null) =>
  pb.send('/backend/v1/ask', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
    headers: { 'Content-Type': 'application/json' },
  })
