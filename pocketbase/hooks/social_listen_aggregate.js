routerAdd(
  'POST',
  '/backend/v1/social/aggregate',
  (e) => {
    try {
      const snaps = $app.findRecordsByFilter('vtracker_snapshots', '', '-created', 7, 0)
      const demands = $app.findRecordsByFilter('demands', '', '-negative_volume', 20, 0)
      const topics = $app.findRecordsByFilter('social_topics', 'active=true', '', 50, 0)

      if (!snaps.length) return e.json(200, { success: false, reason: 'Sem snapshots' })

      const latest = snaps[0]
      const terms = latest.get('emerging_terms') || []
      const insightCol = $app.findCollectionByNameOrId('strategic_insights')
      const created = []

      for (const t of terms) {
        if (!t || !t.term) continue
        const title = 'Tópico emergente: ' + t.term
        try {
          $app.findFirstRecordByData('strategic_insights', 'title', title)
        } catch (_) {
          const r = new Record(insightCol)
          r.set('module', 'social')
          r.set('title', title)
          r.set(
            'summary',
            "Termo '" +
              t.term +
              "' com delta de crescimento " +
              t.delta +
              'x e ' +
              (t.mentions || 0) +
              ' menções.',
          )
          r.set('type', 'trend')
          r.set('confidence', Math.min(95, Math.round((t.delta || 1) * 25)))
          r.set('source_data', { term: t.term, delta: t.delta, mentions: t.mentions })
          $app.save(r)
          created.push(title)
        }
      }

      for (const d of demands.slice(0, 3)) {
        const title = 'Demanda em alta: ' + d.getString('title').substring(0, 60)
        try {
          $app.findFirstRecordByData('strategic_insights', 'title', title)
        } catch (_) {
          const r = new Record(insightCol)
          r.set('module', 'social')
          r.set('title', title)
          r.set('summary', d.getString('description'))
          r.set('type', 'risk')
          r.set('confidence', Math.min(90, d.getInt('negative_volume') / 5))
          r.set('source_data', { demand_id: d.id, negative_volume: d.getInt('negative_volume') })
          $app.save(r)
          created.push(title)
        }
      }

      return e.json(200, {
        success: true,
        insights_created: created.length,
        insights: created,
        topics_monitored: topics.length,
        demands_analyzed: demands.length,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
