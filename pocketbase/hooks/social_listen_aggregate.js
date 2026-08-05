routerAdd(
  'POST',
  '/backend/v1/social/aggregate',
  (e) => {
    try {
      let snapshots = []
      try {
        snapshots = $app.findRecordsByFilter('vtracker_snapshots', "id != ''", '-created', 50, 0)
      } catch (fetchErr) {
        $app.logger().error('social aggregate: fetch failed', 'error', String(fetchErr))
      }

      var sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
      var totalReach = 0
      var totalMentions = 0
      var polarityValues = []
      var termCounts = {}

      for (var i = 0; i < snapshots.length; i++) {
        var pos = snapshots[i].getInt('positive_volume') || 0
        var neg = snapshots[i].getInt('negative_volume') || 0
        var neu = snapshots[i].getInt('neutral_volume') || 0
        var mentions = snapshots[i].getInt('mention_volume') || 0
        var polarity = snapshots[i].getFloat('polarity_index') || 0

        sentimentCounts.positive += pos
        sentimentCounts.negative += neg
        sentimentCounts.neutral += neu
        totalMentions += mentions
        totalReach += mentions
        polarityValues.push(polarity)

        var termsRaw = snapshots[i].get('emerging_terms')
        if (termsRaw) {
          var terms = termsRaw
          if (typeof terms === 'string') {
            try {
              terms = JSON.parse(terms)
            } catch (_) {}
          }
          if (Array.isArray(terms)) {
            for (var j = 0; j < terms.length; j++) {
              var term =
                typeof terms[j] === 'string'
                  ? terms[j]
                  : terms[j] && terms[j].term
                    ? terms[j].term
                    : ''
              if (term) termCounts[term] = (termCounts[term] || 0) + 1
            }
          }
        }
      }

      var topTerms = Object.keys(termCounts)
        .map(function (term) {
          return { term: term, count: termCounts[term] }
        })
        .sort(function (a, b) {
          return b.count - a.count
        })
        .slice(0, 15)

      var avgPolarity = 0
      if (polarityValues.length > 0) {
        var sum = 0
        for (var p = 0; p < polarityValues.length; p++) sum += polarityValues[p]
        avgPolarity = Math.round((sum / polarityValues.length) * 100) / 100
      }

      return e.json(200, {
        total_mentions: totalMentions,
        sentiment: sentimentCounts,
        top_terms: topTerms,
        total_reach: totalReach,
        avg_polarity: avgPolarity,
        snapshots_analyzed: snapshots.length,
      })
    } catch (err) {
      $app.logger().error('social aggregate failed', 'error', String(err))
      return e.json(500, { error: 'Failed to aggregate social listening data' })
    }
  },
  $apis.requireAuth(),
)
