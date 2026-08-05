routerAdd(
  'POST',
  '/backend/v1/executive/summary',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const period = body.period || 'daily'

      let snapshots = []
      try {
        snapshots = $app.findRecordsByFilter('vtracker_snapshots', "id != ''", '-created', 20, 0)
      } catch (fetchErr) {
        $app.logger().error('exec summary: fetch snapshots failed', 'error', String(fetchErr))
      }

      let alerts = []
      try {
        alerts = $app.findRecordsByFilter(
          'crisis_alerts',
          "status != 'resolvido' && status != 'descartado'",
          '-created',
          10,
          0,
        )
      } catch (fetchErr) {
        $app.logger().error('exec summary: fetch alerts failed', 'error', String(fetchErr))
      }

      let totalMentions = 0
      let totalNegative = 0
      let avgPolarity = 0
      for (var i = 0; i < snapshots.length; i++) {
        totalMentions += snapshots[i].getInt('mention_volume') || 0
        totalNegative += snapshots[i].getInt('negative_volume') || 0
        avgPolarity += snapshots[i].getFloat('polarity_index') || 0
      }
      if (snapshots.length > 0) avgPolarity = avgPolarity / snapshots.length

      var emergingTerms = []
      for (var j = 0; j < snapshots.length && emergingTerms.length < 10; j++) {
        var termsRaw = snapshots[j].get('emerging_terms')
        if (termsRaw) {
          var terms = termsRaw
          if (typeof terms === 'string') {
            try {
              terms = JSON.parse(terms)
            } catch (_) {}
          }
          if (Array.isArray(terms)) {
            for (var k = 0; k < terms.length && emergingTerms.length < 10; k++) {
              var term =
                typeof terms[k] === 'string'
                  ? terms[k]
                  : terms[k] && terms[k].term
                    ? terms[k].term
                    : ''
              if (term && emergingTerms.indexOf(term) === -1) emergingTerms.push(term)
            }
          }
        }
      }

      var context = 'Periodo: ' + period + '. '
      context += 'Total de mencoes recentes: ' + totalMentions + '. '
      context += 'Volume negativo: ' + totalNegative + '. '
      context += 'Polaridade media: ' + Math.round(avgPolarity * 100) / 100 + '. '
      context += 'Alertas ativos: ' + alerts.length + '. '
      if (emergingTerms.length > 0) {
        context += 'Termos em alta: ' + emergingTerms.join(', ') + '.'
      }

      var reply = $ai.chat({
        model: 'reasoning',
        messages: [
          {
            role: 'system',
            content:
              'Voce e o Copiloto Estrategico Imagis. Gere um resumo executivo conciso em portugues brasileiro, estruturado com: 1) Resumo Executivo, 2) Principais Descobertas, 3) Indicadores, 4) Tendencias, 5) Pontos de Atencao, 6) Recomendacoes. Use Markdown. Diferencie dados observados de inferencias do modelo.',
          },
          {
            role: 'user',
            content: 'Gere um resumo executivo com base nos seguintes dados: ' + context,
          },
        ],
      })

      return e.json(200, {
        period: period,
        summary: reply.choices[0].message.content,
        mentions_count: totalMentions,
        negative_count: totalNegative,
        avg_polarity: Math.round(avgPolarity * 100) / 100,
        alerts_count: alerts.length,
        emerging_terms: emergingTerms,
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
      $app.logger().error('executive summary failed', 'error', String(err))
      return e.json(500, { error: 'Failed to generate executive summary' })
    }
  },
  $apis.requireAuth(),
)
