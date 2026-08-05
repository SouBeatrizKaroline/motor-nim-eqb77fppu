routerAdd(
  'POST',
  '/backend/v1/social/aggregate',
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
          500,
          0,
          { mid: mandateId },
        )
      } catch (fetchErr) {
        $app.logger().error('social aggregate: fetch failed', 'error', String(fetchErr))
      }

      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
      const sourceCounts = {}
      const termCounts = {}
      let totalReach = 0

      for (const m of mentions) {
        const sentiment = m.getString('sentiment') || 'neutral'
        if (sentimentCounts[sentiment] !== undefined) sentimentCounts[sentiment]++

        const source = m.getString('source') || 'unknown'
        sourceCounts[source] = (sourceCounts[source] || 0) + 1

        const term = m.getString('term') || m.getString('keyword') || ''
        if (term) termCounts[term] = (termCounts[term] || 0) + 1

        totalReach += m.getInt('reach') || 0
      }

      const topTerms = Object.keys(termCounts)
        .map(function (term) {
          return { term: term, count: termCounts[term] }
        })
        .sort(function (a, b) {
          return b.count - a.count
        })
        .slice(0, 10)

      return e.json(200, {
        mandate_id: mandateId,
        total_mentions: mentions.length,
        sentiment: sentimentCounts,
        sources: sourceCounts,
        top_terms: topTerms,
        total_reach: totalReach,
      })
    } catch (err) {
      $app.logger().error('social aggregate failed', 'error', String(err))
      return e.json(500, { error: 'Failed to aggregate social listening data' })
    }
  },
  $apis.requireAuth(),
)
