routerAdd(
  'POST',
  '/backend/v1/anomaly/detect',
  (e) => {
    try {
      const snaps = $app.findRecordsByFilter('vtracker_snapshots', '', '-created', 30, 0)
      if (snaps.length < 3)
        return e.json(200, { success: false, reason: 'Dados insuficientes para detecção' })

      const negVols = snaps.map(function (s) {
        return s.getInt('negative_volume')
      })
      const latest = negVols[0]
      const baseline = negVols.slice(1)

      const mean =
        baseline.reduce(function (a, b) {
          return a + b
        }, 0) / baseline.length
      const variance =
        baseline.reduce(function (a, b) {
          return a + Math.pow(b - mean, 2)
        }, 0) / baseline.length
      const std = Math.sqrt(variance)

      const zScore = std > 0 ? (latest - mean) / std : 0

      const window = Math.min(7, baseline.length)
      const movingAvg =
        baseline.slice(0, window).reduce(function (a, b) {
          return a + b
        }, 0) / window

      let ewma = baseline[baseline.length - 1]
      const alpha = 0.3
      for (let i = baseline.length - 2; i >= 0; i--) {
        ewma = alpha * baseline[i] + (1 - alpha) * ewma
      }

      let cusumPos = 0
      const k = std * 0.5
      for (const v of baseline) {
        cusumPos = Math.max(0, cusumPos + v - mean - k)
      }
      const cusumLatest = Math.max(0, cusumPos + latest - mean - k)

      const anomalies = []
      if (zScore > 2)
        anomalies.push({
          algorithm: 'Z-Score',
          value: Math.round(zScore * 100) / 100,
          threshold: 2,
        })
      if (latest > movingAvg * 2)
        anomalies.push({
          algorithm: 'Moving Average',
          value: latest,
          threshold: Math.round(movingAvg * 2),
        })
      if (latest > ewma * 2)
        anomalies.push({ algorithm: 'EWMA', value: latest, threshold: Math.round(ewma * 2) })
      if (cusumLatest > cusumPos * 3 && cusumLatest > 50)
        anomalies.push({
          algorithm: 'CUSUM',
          value: Math.round(cusumLatest),
          threshold: Math.round(cusumPos * 3),
        })

      let crisisTriggered = false
      if (anomalies.length >= 2) {
        try {
          const detectRes = $http.send({
            url: $os.getenv('PB_INSTANCE_URL') + '/backend/v1/crisis/detect',
            method: 'POST',
            headers: { Authorization: e.request.header.get('Authorization') || '' },
            timeout: 15,
          })
          if (detectRes.statusCode === 200) {
            const body = detectRes.json
            crisisTriggered = body && body.alert_created
          }
        } catch (_) {}
      }

      return e.json(200, {
        success: true,
        latest_negative: latest,
        mean: Math.round(mean),
        std: Math.round(std * 100) / 100,
        z_score: Math.round(zScore * 100) / 100,
        moving_avg: Math.round(movingAvg),
        ewma: Math.round(ewma),
        cusum: Math.round(cusumLatest),
        anomalies_detected: anomalies.length,
        anomalies: anomalies,
        crisis_triggered: crisisTriggered,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
