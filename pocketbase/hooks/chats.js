routerAdd(
  'GET',
  '/backend/v1/chats',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')

      const conversations = $ai
        .agent('imagis-analista')
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
  '/backend/v1/chats/{conversationId}/messages',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      const convId = e.request.pathValue('conversationId')

      const messages = $ai.agent('imagis-analista').listMessages({
        conversation_id: convId,
        user_id: userId,
      })
      return e.json(200, messages)
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
