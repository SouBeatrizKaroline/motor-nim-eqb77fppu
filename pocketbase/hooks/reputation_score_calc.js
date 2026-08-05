routerAdd(
  'POST',
  '/backend/v1/reputation/calc',
  (e) => {
    try {
      const snaps = $app.findRecordsByFilter('vtracker_snapshots', '', '-created', 10, 0)
      const auds = $app.findRecordsByFilter('audience_snapshots', '', '-date', 10, 0)
      if (!snaps.length)
        return e.json(200, { success: false, reason: 'Sem snapshots do V-Tracker' })

      const latest = snaps[0]
      const latestAud = auds.length > 0 ? auds[0] : null

      const negVol = latest.getInt('negative_volume')
      const posVol = latest.getInt('positive_volume')
      const totalVol = latest.getInt('mention_volume') || 1
      const polarity = latest.getFloat('polarity_index')

      const sentiment = Math.round(((polarity + 1) / 2) * 100)
      const reach = latestAud ? Math.min(100, Math.round(latestAud.getInt('reach') / 3000)) : 50
      const engagement = latestAud
        ? Math.min(100, Math.round(latestAud.getFloat('engagement_rate') * 10))
        : 45
      const trust = Math.round(((posVol / totalVol) * 100 + sentiment) / 2)
      const authority = Math.min(100, Math.round(totalVol / 15))
      const mentionFrequency = Math.min(100, Math.round(totalVol / 12))
      const polarization = Math.round((Math.abs(negVol - posVol) / totalVol) * 100) / 100

      let growthSum = 0,
        growthCount = 0
      for (let i = 1; i < auds.length; i++) {
        growthSum += auds[i - 1].getInt('followers') - auds[i].getInt('followers')
        growthCount++
      }
      const growthSpeed =
        growthCount > 0 ? Math.max(0, Math.min(100, Math.round(growthSum / growthCount / 50))) : 10

      const demands = $app.findRecordsByFilter('demands', '', '', 100, 0)
      const regionalInfluence = Math.min(100, 40 + demands.length * 5)

      const prsScore = Math.round(
        (sentiment +
          reach +
          engagement +
          trust +
          authority +
          mentionFrequency +
          (100 - polarization * 50) +
          growthSpeed +
          regionalInfluence) /
          9,
      )

      const col = $app.findCollectionByNameOrId('reputation_scores')
      const rec = new Record(col)
      const today = new Date().toISOString().split('T')[0]
      rec.set('date', today)
      rec.set('prs_score', prsScore)
      rec.set('sentiment', sentiment)
      rec.set('reach', reach)
      rec.set('engagement', engagement)
      rec.set('trust', trust)
      rec.set('authority', authority)
      rec.set('mention_frequency', mentionFrequency)
      rec.set('polarization', polarization)
      rec.set('growth_speed', growthSpeed)
      rec.set('regional_influence', regionalInfluence)
      $app.save(rec)

      return e.json(200, {
        success: true,
        prs_score: prsScore,
        components: {
          sentiment,
          reach,
          engagement,
          trust,
          authority,
          mentionFrequency,
          polarization,
          growthSpeed,
          regionalInfluence,
        },
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
