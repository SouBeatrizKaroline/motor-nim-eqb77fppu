routerAdd(
  'GET',
  '/backend/v1/copilot/chats',
  (e) => {
    try {
      const userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      const conversations = $ai
        .agent('nim-copiloto')
        .listConversations({ user_id: userId, limit: 20 })
      return e.json(200, conversations)
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/copilot/chats/{conversationId}/messages',
  (e) => {
    try {
      const userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      const messages = $ai.agent('nim-copiloto').listMessages({
        conversation_id: e.request.pathValue('conversationId'),
        user_id: userId,
      })
      return e.json(200, messages)
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha ao buscar mensagens' : err.message })
      }
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
