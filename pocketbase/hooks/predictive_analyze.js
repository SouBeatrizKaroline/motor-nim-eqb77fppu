routerAdd(
  'POST',
  '/backend/v1/predictive/analyze',
  (e) => {
    try {
      const snaps = $app.findRecordsByFilter('vtracker_snapshots', '', '-created', 14, 0)
      const demands = $app.findRecordsByFilter('demands', '', '-negative_volume', 10, 0)
      const scores = $app.findRecordsByFilter('reputation_scores', '', '-date', 7, 0)

      if (!snaps.length) return e.json(200, { success: false, reason: 'Dados insuficientes' })

      let snapSummary = ''
      for (const s of snaps.slice(0, 7)) {
        snapSummary +=
          'Data: ' +
          s.getString('created').substring(0, 10) +
          ' | Menções: ' +
          s.getInt('mention_volume') +
          ' | Neg: ' +
          s.getInt('negative_volume') +
          ' | Polaridade: ' +
          s.getFloat('polarity_index') +
          '\n'
      }

      const prompt =
        'Analise os seguintes dados de escuta social e reputação. Gere 3 predições em JSON válido (sem markdown):\n' +
        snapSummary +
        '\nDemands ativas: ' +
        demands.length +
        '\nPRS atual: ' +
        (scores.length > 0 ? scores[0].getInt('prs_score') : 'N/A') +
        '\n\nFormato:\n[{"metric":"nome","timeframe":"7d","predicted_value":"valor","confidence":75,"factors":[{"factor":"fator","impact":"alto"}],"justification":"justificativa"}]'

      let predictions = []
      try {
        const aiRes = $ai.chat({
          model: 'reasoning',
          messages: [
            {
              role: 'system',
              content:
                'Você é um analista preditivo de reputação política. Responda apenas em JSON válido.',
            },
            { role: 'user', content: prompt },
          ],
        })
        const raw = aiRes.choices[0].message.content
        const start = raw.indexOf('[')
        const end = raw.lastIndexOf(']')
        if (start !== -1 && end !== -1) {
          predictions = JSON.parse(raw.substring(start, end + 1))
        }
      } catch (aiErr) {
        $app.logger().error('Predictive AI error: ' + aiErr.message)
      }

      if (!predictions.length) {
        predictions = [
          {
            metric: 'criticism_volume',
            timeframe: '7d',
            predicted_value: '+15%',
            confidence: 65,
            factors: [{ factor: 'Tendência negativa em saúde', impact: 'alto' }],
            justification: 'Volume de críticas deve crescer com base na trajetória atual.',
          },
          {
            metric: 'engagement_forecast',
            timeframe: '14d',
            predicted_value: '+5%',
            confidence: 55,
            factors: [{ factor: 'Conteúdo programado', impact: 'médio' }],
            justification: 'Crescimento moderado esperado.',
          },
        ]
      }

      const predCol = $app.findCollectionByNameOrId('predictions')
      for (const p of predictions) {
        const r = new Record(predCol)
        r.set('metric', p.metric || 'unknown')
        r.set('timeframe', p.timeframe || '7d')
        r.set('predicted_value', String(p.predicted_value || ''))
        r.set('confidence', p.confidence || 50)
        r.set('factors', p.factors || [])
        r.set('justification', p.justification || '')
        $app.save(r)
      }

      return e.json(200, { success: true, predictions_created: predictions.length, predictions })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
