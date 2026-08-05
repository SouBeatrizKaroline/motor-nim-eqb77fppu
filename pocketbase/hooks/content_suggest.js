routerAdd(
  'POST',
  '/backend/v1/content/suggest',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const topic = body.topic || body.mandate_id || ''

      var topTerms = []
      try {
        var snapshots = $app.findRecordsByFilter('vtracker_snapshots', "id != ''", '-created', 3, 0)
        for (var i = 0; i < snapshots.length; i++) {
          var termsRaw = snapshots[i].get('emerging_terms')
          if (termsRaw) {
            var terms = termsRaw
            if (typeof terms === 'string') {
              try {
                terms = JSON.parse(terms)
              } catch (_) {}
            }
            if (Array.isArray(terms)) {
              for (var j = 0; j < terms.length; j++) {
                var term =
                  typeof terms[j] === 'string'
                    ? terms[j]
                    : terms[j] && terms[j].term
                      ? terms[j].term
                      : ''
                if (term && topTerms.indexOf(term) === -1) topTerms.push(term)
                if (topTerms.length >= 10) break
              }
            }
          }
          if (topTerms.length >= 10) break
        }
      } catch (_) {}

      try {
        var demands = $app.findRecordsByFilter('demands', "id != ''", '-negative_volume', 5, 0)
        for (var k = 0; k < demands.length; k++) {
          var title = demands[k].getString('title')
          if (title && topTerms.indexOf(title) === -1) topTerms.push(title)
          if (topTerms.length >= 15) break
        }
      } catch (_) {}

      var prompt =
        'Voce e um assessor de comunicacao politica brasileiro. ' +
        'Termos em alta: ' +
        (topTerms.length > 0 ? topTerms.join(', ') : 'atualidades politicas') +
        '. Sugira 3 conteudos sobre: ' +
        (topic || 'atualidades') +
        '. Responda em JSON com array de {titulo, descricao, hashtags}.'

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Voce e um assessor de comunicacao politica brasileiro. Responda sempre em portugues.',
          },
          { role: 'user', content: prompt },
        ],
      })

      return e.json(200, {
        suggestions: reply.choices[0].message.content,
        top_terms: topTerms,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporariamente indisponivel' })
      if (err instanceof SkipAiError) {
        var status = err.status || 502
        return e.json(status, {
          error: status >= 500 ? 'AI temporariamente indisponivel' : err.message,
        })
      }
      $app.logger().error('content suggest failed', 'error', String(err))
      return e.json(500, { error: 'Failed to generate content suggestions' })
    }
  },
  $apis.requireAuth(),
)
