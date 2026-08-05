routerAdd(
  'POST',
  '/backend/v1/copilot/ask',
  (e) => {
    try {
      const userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')

      const body = e.requestInfo().body || {}
      const message = typeof body.message === 'string' ? body.message.trim() : ''
      if (!message) return e.badRequestError('Mensagem é obrigatória')

      const result = $ai.agent('nim-copiloto').chat({
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
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha no agente' : err.message })
      }
      if (err instanceof SkipAiError) {
        var s = err.status || 502
        return e.json(s, { error: s >= 500 ? 'IA temporariamente indisponível' : err.message })
      }
      return e.json(500, { error: err.message || 'Erro no copiloto' })
    }
  },
  $apis.requireAuth(),
)
