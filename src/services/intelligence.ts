import pb from '@/lib/pocketbase/client'

export const getAudienceSnapshots = () =>
  pb.collection('audience_snapshots').getFullList({ sort: '-date' })

export const getCompetitiveActors = () =>
  pb.collection('competitive_actors').getFullList({ sort: 'name' })
export const createCompetitiveActor = (data: any) =>
  pb.collection('competitive_actors').create(data)

export const getCompetitiveSnapshots = () =>
  pb.collection('competitive_snapshots').getFullList({ sort: '-date', expand: 'actor' })

export const getContentItems = () =>
  pb.collection('content_items').getFullList({ sort: '-created' })
export const createContentItem = (data: any) => pb.collection('content_items').create(data)
export const updateContentItem = (id: string, data: any) =>
  pb.collection('content_items').update(id, data)
export const deleteContentItem = (id: string) => pb.collection('content_items').delete(id)

export const getReputationScores = () =>
  pb.collection('reputation_scores').getFullList({ sort: '-date' })

export const getBrandAttributes = () =>
  pb.collection('brand_attributes').getFullList({ sort: '-created' })

export const getPredictions = () => pb.collection('predictions').getFullList({ sort: '-created' })

export const getStrategicInsights = (module?: string) =>
  pb.collection('strategic_insights').getFullList({
    sort: '-created',
    filter: module ? `module="${module}"` : '',
  })

export const getSocialTopics = () => pb.collection('social_topics').getFullList({ sort: 'term' })
export const createSocialTopic = (data: any) => pb.collection('social_topics').create(data)
export const deleteSocialTopic = (id: string) => pb.collection('social_topics').delete(id)

export const triggerReputationCalc = () =>
  pb.send('/backend/v1/reputation/calc', { method: 'POST' })
export const triggerSocialAggregate = () =>
  pb.send('/backend/v1/social/aggregate', { method: 'POST' })
export const triggerPredictiveAnalyze = () =>
  pb.send('/backend/v1/predictive/analyze', { method: 'POST' })
export const triggerAnomalyDetect = () => pb.send('/backend/v1/anomaly/detect', { method: 'POST' })
export const triggerExecutiveSummary = (period: 'daily' | 'weekly' | 'monthly') =>
  pb.send('/backend/v1/executive/summary', {
    method: 'POST',
    body: JSON.stringify({ period }),
    headers: { 'Content-Type': 'application/json' },
  })
export const triggerContentSuggest = (data: any) =>
  pb.send('/backend/v1/content/suggest', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const triggerContentStudioGenerate = (data: {
  content_type: string
  platform: string
  topic: string
  tom_de_voz: string
  contexto?: string
  publico_alvo?: string
}) =>
  pb.send('/backend/v1/content-studio/generate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
export const askCopilot = (message: string, conversationId?: string | null) =>
  pb.send('/backend/v1/copilot/ask', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
    headers: { 'Content-Type': 'application/json' },
  })
export const getCopilotChats = () => pb.send('/backend/v1/copilot/chats', { method: 'GET' })
export const getCopilotMessages = (conversationId: string) =>
  pb.send(`/backend/v1/copilot/chats/${conversationId}/messages`, { method: 'GET' })
