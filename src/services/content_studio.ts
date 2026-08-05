import pb from '@/lib/pocketbase/client'

export interface BrandIdentity {
  organization_name?: string
  slogan?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  dark_color?: string
  light_color?: string
  primary_font?: string
  secondary_font?: string
  tone_of_voice?: string
  prohibited_terms?: string[]
  default_hashtags?: string[]
  logo_url?: string
  key_pilars?: string[]
}

export interface ContentItemBriefing {
  topic?: string
  content_type?: string
  tom_de_voz?: string
  contexto?: string
  publico_alvo?: string
  hashtags?: string[]
  cta?: string
  palavras_chave?: string[]
  tempo_leitura?: string
  justificativa?: string
  fontes_contexto?: string[]
  slides?: Array<{
    slide: number
    titulo: string
    texto: string
    imagem_sugestao?: string
  }>
  video_storyboard?: Array<{
    cena: number
    tempo?: string
    enquadramento?: string
    audio?: string
    legenda?: string
  }>
  thumbnail_prompt?: string
  adaptations?: Record<string, string>
  conteudo_curto?: string
  conteudo_medio?: string
  conteudo_longo?: string
}

export interface ContentItemPerformance {
  reach?: number
  impressions?: number
  engagement?: number
  shares?: number
  likes?: number
  comments?: number
  ctr?: number
}

export const getBrandSettings = async (): Promise<BrandIdentity | null> => {
  try {
    const rec = await pb.collection('settings').getFirstListItem('key="brand_identity"')
    if (!rec) return null
    return typeof rec.value === 'string' ? JSON.parse(rec.value) : rec.value
  } catch {
    return null
  }
}

export const saveBrandSettings = async (data: BrandIdentity) => {
  const rec = await pb
    .collection('settings')
    .getFirstListItem('key="brand_identity"')
    .catch(() => null)
  if (rec) {
    return await pb.collection('settings').update(rec.id, { value: data })
  } else {
    return await pb.collection('settings').create({ key: 'brand_identity', value: data })
  }
}

export const getContentStudioItems = () =>
  pb.collection('content_items').getFullList({ sort: '-created' })

export const getContentStudioItem = (id: string) => pb.collection('content_items').getOne(id)

export const createContentStudioItem = (data: Record<string, any>) =>
  pb.collection('content_items').create(data)

export const updateContentStudioItem = (id: string, data: Record<string, any>) =>
  pb.collection('content_items').update(id, data)

export const deleteContentStudioItem = (id: string) => pb.collection('content_items').delete(id)

export const updateItemStatus = (id: string, status: string, extra?: Record<string, any>) => {
  const payload: Record<string, any> = { status, ...extra }
  if (status === 'published' && !payload.published_at) {
    payload.published_at = new Date().toISOString()
  }
  return pb.collection('content_items').update(id, payload)
}

export const generateStudioContent = (data: {
  content_type: string
  platform: string
  topic: string
  tom_de_voz: string
  contexto?: string
  publico_alvo?: string
  use_brand?: boolean
}) =>
  pb.send('/backend/v1/content-studio/generate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
