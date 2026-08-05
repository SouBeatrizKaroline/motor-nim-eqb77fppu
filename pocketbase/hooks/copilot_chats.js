routerAdd(
  'GET',
  '/backend/v1/copilot/chats',
  (e) => {
    try {
      const userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      const limit =
        parseInt(e.requestInfo().query ? e.requestInfo().query.limit || '20' : '20', 10) || 20
      return e.json(
        200,
        $ai.agent('imagis-copiloto').listConversations({ user_id: userId, limit: limit }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'conversation lookup failed' : err.message })
      }
      $app.logger().error('copilot chats failed', 'error', String(err))
      return e.json(500, { error: 'Failed to list conversations' })
    }
  },
  $apis.requireAuth(),
)
