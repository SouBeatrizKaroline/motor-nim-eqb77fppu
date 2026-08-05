routerAdd(
  'POST',
  '/backend/v1/reputation/calculate',
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
          200,
          0,
          { mid: mandateId },
        )
      } catch (fetchErr) {
        $app.logger().error('reputation: fetch mentions failed', 'error', String(fetchErr))
      }

      let positive = 0
      let negative = 0
      let neutral = 0
      let totalReach = 0

      for (const m of mentions) {
        const sentiment = m.getString('sentiment') || 'neutral'
        const reach = m.getInt('reach') || 0
        totalReach += reach
        if (sentiment === 'positive') positive++
        else if (sentiment === 'negative') negative++
        else neutral++
      }

      const total = mentions.length || 1
      const rawScore = 50 + ((positive - negative) / total) * 50
      const score = Math.max(0, Math.min(100, Math.round(rawScore)))

      return e.json(200, {
        mandate_id: mandateId,
        score,
        positive,
        negative,
        neutral,
        total_mentions: mentions.length,
        total_reach: totalReach,
      })
    } catch (err) {
      $app.logger().error('reputation calc failed', 'error', String(err))
      return e.json(500, { error: 'Failed to calculate reputation score' })
    }
  },
  $apis.requireAuth(),
)
