routerAdd(
  'POST',
  '/backend/v1/executive/summary',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const period = body.period || 'daily'

      const alerts = $app.findRecordsByFilter(
        'crisis_alerts',
        "status != 'resolvido' && status != 'descartado'",
        '-created',
        5,
        0,
      )
      const scores = $app.findRecordsByFilter('reputation_scores', '', '-date', 7, 0)
      const preds = $app.findRecordsByFilter('predictions', '', '-created', 5, 0)
      const insights = $app.findRecordsByFilter('strategic_insights', '', '-created', 10, 0)

      let context = 'RESUMO EXECUTIVO (' + period.toUpperCase() + ')\n\n'
      context += 'Alertas ativos: ' + alerts.length + '\n'
      for (const a of alerts) {
        context +=
          '- [' + a.getString('severity') + '] ' + a.getString('summary').substring(0, 100) + '\n'
      }
      context +=
        '\nReputação (PRS): ' + (scores.length > 0 ? scores[0].getInt('prs_score') : 'N/A') + '\n'
      context += 'Predições: ' + preds.length + '\n'
      for (const p of preds) {
        context +=
          '- ' +
          p.getString('metric') +
          ' (' +
          p.getString('timeframe') +
          '): ' +
          p.getString('predicted_value') +
          ' [confiança: ' +
          p.getInt('confidence') +
          '%]\n'
      }
      context += '\nInsights estratégicos: ' + insights.length + '\n'
      for (const i of insights) {
        context += '- [' + i.getString('type') + '] ' + i.getString('title').substring(0, 80) + '\n'
      }

      let summary = ''
      try {
        const aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente executivo de inteligência política. Gere um resumo executivo conciso e acionável em português.',
            },
            {
              role: 'user',
              content: 'Gere um resumo executivo ' + period + ' com base nos dados:\n\n' + context,
            },
          ],
        })
        summary = aiRes.choices[0].message.content
      } catch (aiErr) {
        summary =
          'Resumo automático temporariamente indisponível. ' +
          alerts.length +
          ' alertas ativos, PRS: ' +
          (scores.length > 0 ? scores[0].getInt('prs_score') : 'N/A') +
          '.'
      }

      return e.json(200, { success: true, period: period, summary: summary })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
