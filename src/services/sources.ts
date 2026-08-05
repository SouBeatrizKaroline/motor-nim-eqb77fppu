import pb from '@/lib/pocketbase/client'

export interface SourceReference {
  id?: string
  title: string
  description: string
  origin: string
  source: string
  link: string
  collected_at: string
  author_org: string
  category: string
  reliability: string
  source_type: string
  context: string
  limitations_biases: string
  observations: string
  related_type: string
  related_id: string
}

export interface KnowledgeEntry {
  id?: string
  source: string
  theme: string
  insight: string
  application: string
  reference: string
}

export const getSourceReferences = () =>
  pb.collection('source_references').getFullList({ sort: '-created' })

export const getSourceReference = (id: string) => pb.collection('source_references').getOne(id)

export const createSourceReference = (data: Partial<SourceReference>) =>
  pb.collection('source_references').create(data)

export const updateSourceReference = (id: string, data: Partial<SourceReference>) =>
  pb.collection('source_references').update(id, data)

export const deleteSourceReference = (id: string) => pb.collection('source_references').delete(id)

export const getKnowledgeEntries = () =>
  pb.collection('knowledge_entries').getFullList({ sort: '-created', expand: 'reference' })

export const getKnowledgeEntry = (id: string) =>
  pb.collection('knowledge_entries').getOne(id, { expand: 'reference' })

export const createKnowledgeEntry = (data: Partial<KnowledgeEntry>) =>
  pb.collection('knowledge_entries').create(data)

export const updateKnowledgeEntry = (id: string, data: Partial<KnowledgeEntry>) =>
  pb.collection('knowledge_entries').update(id, data)

export const deleteKnowledgeEntry = (id: string) => pb.collection('knowledge_entries').delete(id)
