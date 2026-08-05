routerAdd(
  'POST',
  '/backend/v1/predictive/analyze',
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
          100,
          0,
          { mid: mandateId },
        )
      } catch (fetchErr) {
        $app.logger().error('predictive: fetch mentions failed', 'error', String(fetchErr))
      }

      let positive = 0
      let negative = 0
      let neutral = 0

      for (const m of mentions) {
        const s = m.getString('sentiment') || 'neutral'
        if (s === 'positive') positive++
        else if (s === 'negative') negative++
        else neutral++
      }

      const data =
        'Total: ' +
        mentions.length +
        '. Positivas: ' +
        positive +
        '. Negativas: ' +
        negative +
        '. Neutras: ' +
        neutral +
        '.'

      const reply = $ai.chat({
        model: 'reasoning',
        messages: [
          {
            role: 'system',
            content:
              'Você é um analista preditivo de inteligência política. Analise tendências e faça previsões em português.',
          },
          {
            role: 'user',
            content:
              'Com base nos dados de escuta social: ' +
              data +
              '. Faça uma análise preditiva dos próximos 7 dias.',
          },
        ],
      })

      return e.json(200, {
        mandate_id: mandateId,
        analysis: reply.choices[0].message.content,
        data_snapshot: {
          total: mentions.length,
          positive: positive,
          negative: negative,
          neutral: neutral,
        },
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
      $app.logger().error('predictive analyze failed', 'error', String(err))
      return e.json(500, { error: 'Failed to run predictive analysis' })
    }
  },
  $apis.requireAuth(),
)
