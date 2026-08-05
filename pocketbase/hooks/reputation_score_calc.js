routerAdd(
  'POST',
  '/backend/v1/reputation/calc',
  (e) => {
    try {
      let snapshots = []
      try {
        snapshots = $app.findRecordsByFilter(
          'vtracker_snapshots',
          'mention_volume > 0',
          '-window_start',
          50,
          0,
        )
      } catch (fetchErr) {
        $app.logger().error('reputation: fetch snapshots failed', 'error', String(fetchErr))
      }

      let positive = 0
      let negative = 0
      let neutral = 0
      let totalReach = 0
      let totalMentions = 0

      for (const s of snapshots) {
        const pos = s.getInt('positive_volume') || 0
        const neg = s.getInt('negative_volume') || 0
        const neu = s.getInt('neutral_volume') || 0
        const mentions = s.getInt('mention_volume') || 0
        positive += pos
        negative += neg
        neutral += neu
        totalMentions += mentions
        totalReach += mentions
      }

      const total = positive + negative + neutral || 1
      const rawScore = 50 + ((positive - negative) / total) * 50
      const score = Math.max(0, Math.min(100, Math.round(rawScore)))

      let polarization = 0
      if (total > 0) {
        polarization = Math.round((Math.abs(positive - negative) / total) * 100)
      }

      let mentionFreq = totalMentions
      let sentiment = total > 0 ? (positive - negative) / total : 0

      let savedScore = null
      try {
        const repCol = $app.findCollectionByNameOrId('reputation_scores')
        const repRec = new Record(repCol)
        const now = new Date().toISOString().split('T')[0]
        repRec.set('date', now)
        repRec.set('prs_score', score)
        repRec.set('sentiment', Math.round(sentiment * 100) / 100)
        repRec.set('reach', totalReach)
        repRec.set('engagement', 0)
        repRec.set('trust', Math.round(score * 0.8))
        repRec.set('authority', Math.round(score * 0.7))
        repRec.set('mention_frequency', mentionFreq)
        repRec.set('polarization', polarization)
        repRec.set('growth_speed', 0)
        repRec.set('regional_influence', Math.round(score * 0.6))
        $app.save(repRec)
        savedScore = repRec
      } catch (saveErr) {
        $app.logger().error('reputation: save failed', 'error', String(saveErr))
      }

      return e.json(200, {
        score,
        positive,
        negative,
        neutral,
        total_mentions: totalMentions,
        total_reach: totalReach,
        sentiment: Math.round(sentiment * 100) / 100,
        polarization,
        saved: !!savedScore,
      })
    } catch (err) {
      $app.logger().error('reputation calc failed', 'error', String(err))
      return e.json(500, { error: 'Failed to calculate reputation score' })
    }
  },
  $apis.requireAuth(),
)
