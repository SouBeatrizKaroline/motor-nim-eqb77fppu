routerAdd(
  'POST',
  '/backend/v1/anomaly/detect',
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
        $app.logger().error('anomaly: fetch mentions failed', 'error', String(fetchErr))
      }

      const anomalies = []
      const recent = mentions.slice(0, 50)

      if (recent.length > 20) {
        anomalies.push({
          type: 'volume_spike',
          severity: 'high',
          message: 'Volume de menções acima do normal',
          count: recent.length,
        })
      }

      const negativeRecent = recent.filter(function (m) {
        return m.getString('sentiment') === 'negative'
      })
      if (negativeRecent.length > 10) {
        anomalies.push({
          type: 'negative_sentiment_surge',
          severity: 'high',
          message: 'Surto de sentimentos negativos detectado',
          count: negativeRecent.length,
        })
      }

      return e.json(200, {
        mandate_id: mandateId,
        anomalies,
        total_anomalies: anomalies.length,
      })
    } catch (err) {
      $app.logger().error('anomaly detect failed', 'error', String(err))
      return e.json(500, { error: 'Failed to detect anomalies' })
    }
  },
  $apis.requireAuth(),
)
