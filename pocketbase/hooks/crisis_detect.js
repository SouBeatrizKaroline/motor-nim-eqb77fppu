routerAdd(
  'POST',
  '/backend/v1/crisis/detect',
  (e) => {
    try {
      const snapshots = $app.findRecordsByFilter('vtracker_snapshots', '', '-created', 10, 0)
      if (!snapshots || snapshots.length === 0) {
        return e.json(200, { alert_created: false, reason: 'Nenhum snapshot encontrado' })
      }

      const latest = snapshots[0]
      const negVol = latest.getInt('negative_volume')
      const polarity = latest.getFloat('polarity_index')
      const mentionVol = latest.getInt('mention_volume')

      let baselineNegSum = 0,
        count = 0
      for (let i = 1; i < snapshots.length; i++) {
        baselineNegSum += snapshots[i].getInt('negative_volume')
        count++
      }
      const avgNegBaseline = count > 0 ? baselineNegSum / count : 100
      const ratio = negVol / (avgNegBaseline || 1)

      let createdAlert = false
      let alertId = null

      if (negVol > 200 && (ratio >= 2.0 || polarity < -0.15)) {
        const crisisCol = $app.findCollectionByNameOrId('crisis_alerts')
        const alertRec = new Record(crisisCol)

        let severity = 'média'
        if (ratio >= 4.0 || negVol >= 500) severity = 'crítica'
        else if (ratio >= 3.0 || negVol >= 350) severity = 'alta'

        const terms = latest.get('emerging_terms') || []
        const topTerm = terms.length > 0 ? terms[0].term : 'atendimento público'

        const riskEstimate = Math.min(100, Math.round(ratio * 20))
        const potentialReach = Math.round(mentionVol * 3.5)

        alertRec.set(
          'summary',
          "Anomalia detectada em escuta social: surto de menções negativas relacionado a '" +
            topTerm +
            "'",
        )
        alertRec.set('severity', severity)
        alertRec.set('status', 'detectado')
        alertRec.set('trigger_metrics', {
          window_negative: negVol,
          baseline_negative: Math.round(avgNegBaseline),
          increase_ratio: Math.round(ratio * 10) / 10 + 'x',
          polarity: polarity,
        })
        alertRec.set('related_snapshot', latest.id)
        alertRec.set('sent_status', 'pendente')
        alertRec.set('risk_estimate', riskEstimate)
        alertRec.set('potential_reach', potentialReach)
        alertRec.set('executive_summary', '')
        alertRec.set('timeline', [])
        alertRec.set('main_concerns', [])
        alertRec.set('recurring_questions', [])
        alertRec.set('faq', [])
        alertRec.set('communication_plan', '')
        alertRec.set('response_schedule', [])
        alertRec.set('operational_checklist', [])
        $app.save(alertRec)

        createdAlert = true
        alertId = alertRec.id

        try {
          const pipeCol = $app.findCollectionByNameOrId('pipeline_runs')
          const pipeRec = new Record(pipeCol)
          pipeRec.set('pipeline', 'crise')
          pipeRec.set('trigger', 'api')
          pipeRec.set('status', 'sucesso')
          pipeRec.set('stage', 'detecção')
          pipeRec.set('input', { snapshot_id: latest.id, negVol: negVol })
          pipeRec.set('output', { alert_id: alertId, severity: severity })
          pipeRec.set('started_at', new Date().toISOString())
          pipeRec.set('finished_at', new Date().toISOString())
          $app.save(pipeRec)
        } catch (_) {}
      }

      return e.json(200, {
        alert_created: createdAlert,
        alert_id: alertId,
        metrics: {
          latest_negative: negVol,
          baseline_avg: Math.round(avgNegBaseline),
          increase_ratio: Math.round(ratio * 10) / 10 + 'x',
          polarity: polarity,
        },
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
