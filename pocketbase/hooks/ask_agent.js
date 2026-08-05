routerAdd(
  'POST',
  '/backend/v1/ask',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')

      const body = e.requestInfo().body || {}
      const message =
        typeof body.message === 'string'
          ? body.message.trim()
          : body.message
            ? String(body.message).trim()
            : ''
      if (!message) return e.badRequestError('Mensagem é obrigatória')

      const result = $ai.agent('imagis-analista').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: message,
      })

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations || [],
        message_id: result.message_id,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'IA temporariamente indisponível' })
      return e.json(500, { error: err.message || 'Erro no agente Imagis' })
    }
  },
  $apis.requireAuth(),
)
