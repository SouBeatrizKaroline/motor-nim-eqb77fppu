routerAdd(
  'GET',
  '/backend/v1/reputation-score',
  (e) => {
    try {
      let snapshots = []
      try {
        snapshots = $app.findRecordsByFilter('vtracker_snapshots', '', '-created', 30, 0)
      } catch (_) {}

      if (!snapshots || snapshots.length === 0) {
        return e.json(200, { score: 50, label: 'neutro', trend: 'estável', history: [] })
      }

      const recent = snapshots.slice(0, 7)
      let totalScore = 0
      const history = []

      for (const snap of recent) {
        const polarity = snap.getFloat('polarity_index') || 0
        const volume = snap.getFloat('mention_volume') || 0
        const negative = snap.getFloat('negative_volume') || 0

        const negRatio = volume > 0 ? negative / volume : 0
        const score = Math.max(0, Math.min(100, 50 + polarity * 50 - negRatio * 20))
        totalScore += score

        history.push({
          date: snap.getString('window_start'),
          score: Math.round(score),
          polarity: polarity,
          volume: volume,
        })
      }

      const avgScore = Math.round(totalScore / recent.length)
      let label = 'neutro'
      if (avgScore >= 70) label = 'positivo'
      else if (avgScore >= 55) label = 'levemente positivo'
      else if (avgScore <= 30) label = 'crítico'
      else if (avgScore <= 45) label = 'negativo'

      let trend = 'estável'
      if (history.length >= 2) {
        const halfIdx = Math.min(3, history.length)
        const recentAvg = history.slice(0, halfIdx).reduce((s, h) => s + h.score, 0) / halfIdx
        const olderCount = history.length - halfIdx
        const olderAvg =
          olderCount > 0
            ? history.slice(halfIdx).reduce((s, h) => s + h.score, 0) / olderCount
            : recentAvg
        if (recentAvg > olderAvg + 3) trend = 'melhorando'
        else if (recentAvg < olderAvg - 3) trend = 'piorando'
      }

      return e.json(200, { score: avgScore, label, trend, history })
    } catch (err) {
      $app.logger().error('reputation score calc failed', 'error', String(err))
      return e.json(500, { error: 'failed to calculate reputation score' })
    }
  },
  $apis.requireAuth(),
)
