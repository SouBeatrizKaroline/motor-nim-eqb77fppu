routerAdd(
  'POST',
  '/backend/v1/executive/summary',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const mandateId = body.mandate_id || body.mandateId

      if (!mandateId) {
        return e.badRequestError('mandate_id is required')
      }

      let mentions = []
      try {
        mentions = $app.findRecordsByFilter(
          'social_mentions',
          'mandate_id = {:mid}',
          '-created',
          50,
          0,
          { mid: mandateId },
        )
      } catch (fetchErr) {
        $app.logger().error('exec summary: fetch mentions failed', 'error', String(fetchErr))
      }

      let alerts = []
      try {
        alerts = $app.findRecordsByFilter('alerts', 'mandate_id = {:mid}', '-created', 10, 0, {
          mid: mandateId,
        })
      } catch (fetchErr) {
        $app.logger().error('exec summary: fetch alerts failed', 'error', String(fetchErr))
      }

      const context =
        'Menções recentes: ' + mentions.length + '. Alertas ativos: ' + alerts.length + '.'

      const reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um copiloto executivo para inteligência política. Gere um resumo executivo conciso em português.',
          },
          {
            role: 'user',
            content: 'Gere um resumo executivo com base nos seguintes dados: ' + context,
          },
        ],
      })

      return e.json(200, {
        mandate_id: mandateId,
        summary: reply.choices[0].message.content,
        mentions_count: mentions.length,
        alerts_count: alerts.length,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporariamente indisponível' })
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, {
          error: status >= 500 ? 'AI temporariamente indisponível' : err.message,
        })
      }
      $app.logger().error('executive summary failed', 'error', String(err))
      return e.json(500, { error: 'Failed to generate executive summary' })
    }
  },
  $apis.requireAuth(),
)
