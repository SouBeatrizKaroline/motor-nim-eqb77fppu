routerAdd(
  'POST',
  '/backend/v1/content/suggest',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const mandateId = body.mandate_id || body.mandateId
      const topic = body.topic || ''

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
        $app.logger().error('content suggest: fetch failed', 'error', String(fetchErr))
      }

      const topTerms = []
      for (const m of mentions) {
        const term = m.getString('term') || m.getString('keyword') || ''
        if (term && topTerms.indexOf(term) === -1) topTerms.push(term)
        if (topTerms.length >= 10) break
      }

      const prompt =
        'Você é um assessor de comunicação política. Termos em alta: ' +
        topTerms.join(', ') +
        '. Sugira 3 conteúdos sobre: ' +
        (topic || 'atualidades') +
        '. Responda em JSON com array de {titulo, descricao, hashtags}.'

      const reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assessor de comunicação política brasileiro. Responda sempre em português.',
          },
          { role: 'user', content: prompt },
        ],
      })

      return e.json(200, {
        mandate_id: mandateId,
        suggestions: reply.choices[0].message.content,
        top_terms: topTerms,
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
      $app.logger().error('content suggest failed', 'error', String(err))
      return e.json(500, { error: 'Failed to generate content suggestions' })
    }
  },
  $apis.requireAuth(),
)
