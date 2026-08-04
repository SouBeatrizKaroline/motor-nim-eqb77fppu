routerAdd(
  'POST',
  '/backend/v1/vtracker/ingest',
  (e) => {
    try {
      const authUser = e.auth
      if (!authUser) return e.unauthorizedError('Autenticação necessária')

      const body = e.requestInfo().body || {}
      let windowStart = new Date().toISOString()
      let windowEnd = new Date().toISOString()
      let mentionVolume = body.mention_volume || Math.floor(Math.random() * 500) + 800
      let negativeVolume = body.negative_volume || Math.floor(Math.random() * 200) + 200
      let positiveVolume = body.positive_volume || Math.floor(Math.random() * 150) + 150
      let neutralVolume = mentionVolume - negativeVolume - positiveVolume
      if (neutralVolume < 0) neutralVolume = 100
      let polarityIndex = (positiveVolume - negativeVolume) / (mentionVolume || 1)
      polarityIndex = Math.round(polarityIndex * 100) / 100

      let emergingTerms = body.emerging_terms || [
        { term: 'filas ubs', delta: 2.5, mentions: 180 },
        { term: 'falta de médico', delta: 3.1, mentions: 240 },
        { term: 'buraco asfalto', delta: 1.8, mentions: 120 },
      ]

      let topPosts = body.top_posts || [
        {
          author: '@cidadao_local',
          text: 'Posto de saúde sem atendimento nesta manhã!',
          sentiment: 'negativo',
          engagement: 310,
          source: 'twitter',
        },
      ]

      const col = $app.findCollectionByNameOrId('vtracker_snapshots')
      const rec = new Record(col)
      rec.set('window_start', windowStart)
      rec.set('window_end', windowEnd)
      rec.set('mention_volume', mentionVolume)
      rec.set('negative_volume', negativeVolume)
      rec.set('positive_volume', positiveVolume)
      rec.set('neutral_volume', neutralVolume)
      rec.set('polarity_index', polarityIndex)
      rec.set('emerging_terms', emergingTerms)
      rec.set('top_posts', topPosts)
      rec.set('source_raw', {
        ingested_by: authUser.id,
        timestamp: windowStart,
        mode: body.manual ? 'manual_json' : 'simulated_vtracker',
      })
      $app.save(rec)

      return e.json(200, {
        success: true,
        snapshot_id: rec.id,
        mention_volume: mentionVolume,
        negative_volume: negativeVolume,
        polarity_index: polarityIndex,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
