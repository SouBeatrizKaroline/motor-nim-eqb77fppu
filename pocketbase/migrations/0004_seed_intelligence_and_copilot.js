migrate(
  (app) => {
    const now = Date.now()
    const D = 86400000

    const audCol = app.findCollectionByNameOrId('audience_snapshots')
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * D).toISOString().split('T')[0]
      try {
        app.findFirstRecordByData('audience_snapshots', 'date', date)
      } catch (_) {
        const r = new Record(audCol)
        r.set('date', date)
        r.set('platform', 'instagram')
        r.set('followers', 45000 + (6 - i) * 1200)
        r.set('reach', 120000 + (6 - i) * 8000)
        r.set('impressions', 180000 + (6 - i) * 10000)
        r.set('engagement', 15000 + (6 - i) * 800)
        r.set('engagement_rate', 8.3 + (6 - i) * 0.2)
        r.set('shares', 1200 + (6 - i) * 50)
        r.set('video_completion_rate', 42 + (6 - i))
        r.set('ctr', 3.2 + (6 - i) * 0.1)
        r.set('sentiment', -0.15 + (6 - i) * 0.03)
        app.save(r)
      }
    }

    const repCol = app.findCollectionByNameOrId('reputation_scores')
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * D).toISOString().split('T')[0]
      try {
        app.findFirstRecordByData('reputation_scores', 'date', date)
      } catch (_) {
        const r = new Record(repCol)
        r.set('date', date)
        r.set('prs_score', 58 + (6 - i) * 1.5)
        r.set('sentiment', 45 + (6 - i) * 2)
        r.set('reach', 72 + (6 - i))
        r.set('engagement', 68 + (6 - i) * 1.5)
        r.set('trust', 55 + (6 - i))
        r.set('authority', 70 + (6 - i))
        r.set('mention_frequency', 65 + (6 - i) * 2)
        r.set('polarization', 0.4)
        r.set('growth_speed', 12 + (6 - i) * 0.5)
        r.set('regional_influence', 60 + (6 - i))
        app.save(r)
      }
    }

    const actorCol = app.findCollectionByNameOrId('competitive_actors')
    const actors = [
      {
        name: 'Carlos Mendes',
        role: 'Vereador',
        region: 'Zona Sul',
        platforms: ['instagram', 'tiktok'],
      },
      {
        name: 'Ana Paula Costa',
        role: 'Deputada',
        region: 'Centro',
        platforms: ['instagram', 'twitter', 'youtube'],
      },
      {
        name: 'Roberto Silva',
        role: 'Prefeito',
        region: 'Cidade',
        platforms: ['instagram', 'facebook', 'youtube'],
      },
    ]
    const actorIds = []
    for (const a of actors) {
      try {
        actorIds.push(app.findFirstRecordByData('competitive_actors', 'name', a.name).id)
      } catch (_) {
        const r = new Record(actorCol)
        r.set('name', a.name)
        r.set('role', a.role)
        r.set('region', a.region)
        r.set('platforms', a.platforms)
        r.set('active', true)
        app.save(r)
        actorIds.push(r.id)
      }
    }

    const compSnapCol = app.findCollectionByNameOrId('competitive_snapshots')
    for (const actorId of actorIds) {
      const r = new Record(compSnapCol)
      r.set('actor', actorId)
      r.set('date', new Date(now - D).toISOString().split('T')[0])
      r.set('platform', 'instagram')
      r.set('posts_count', Math.floor(Math.random() * 20) + 5)
      r.set('engagement', Math.floor(Math.random() * 50000) + 10000)
      r.set('estimated_reach', Math.floor(Math.random() * 200000) + 50000)
      r.set('audiences', Math.floor(Math.random() * 80000) + 20000)
      r.set('top_themes', ['saúde', 'educação', 'infraestrutura'])
      app.save(r)
    }

    const contentCol = app.findCollectionByNameOrId('content_items')
    const contents = [
      {
        title: 'Reels: Obras de pavimentação no Jardim América',
        type: 'reels',
        status: 'published',
        campaign: 'Infraestrutura',
      },
      {
        title: 'Post: Melhorias no atendimento da UBS Central',
        type: 'post',
        status: 'draft',
        campaign: 'Saúde',
      },
      {
        title: 'TikTok: Distribuição de tablets nas escolas',
        type: 'tiktok',
        status: 'idea',
        campaign: 'Educação',
      },
      {
        title: 'YouTube: Prestação de contas trimestral',
        type: 'youtube',
        status: 'briefing',
        campaign: 'Transparência',
      },
    ]
    for (const c of contents) {
      try {
        app.findFirstRecordByData('content_items', 'title', c.title)
      } catch (_) {
        const r = new Record(contentCol)
        Object.assign(c, {}).forEach?.(() => {})
        r.set('title', c.title)
        r.set('type', c.type)
        r.set('status', c.status)
        r.set('campaign', c.campaign)
        r.set('channel', c.type)
        app.save(r)
      }
    }

    const brandCol = app.findCollectionByNameOrId('brand_attributes')
    const brands = [
      {
        attribute: 'Acessível',
        category: 'positive',
        strength: 78,
        sentiment: 0.6,
        period: '2025-07',
      },
      {
        attribute: 'Próximo do povo',
        category: 'positive',
        strength: 82,
        sentiment: 0.7,
        period: '2025-07',
      },
      {
        attribute: 'Ineficiente',
        category: 'negative',
        strength: 35,
        sentiment: -0.5,
        period: '2025-07',
      },
      {
        attribute: 'Lutador',
        category: 'positive',
        strength: 71,
        sentiment: 0.5,
        period: '2025-07',
      },
      {
        attribute: 'Acessível',
        category: 'desired',
        strength: 90,
        sentiment: 0.8,
        period: '2025-07',
      },
      {
        attribute: 'Modernizador',
        category: 'desired',
        strength: 85,
        sentiment: 0.7,
        period: '2025-07',
      },
    ]
    for (const b of brands) {
      try {
        app.findFirstRecordByData('brand_attributes', 'attribute', b.attribute + b.category)
      } catch (_) {
        const r = new Record(brandCol)
        r.set('attribute', b.attribute)
        r.set('category', b.category)
        r.set('strength', b.strength)
        r.set('sentiment', b.sentiment)
        r.set('period', b.period)
        app.save(r)
      }
    }

    const predCol = app.findCollectionByNameOrId('predictions')
    const preds = [
      {
        metric: 'criticism_volume',
        timeframe: '7d',
        predicted_value: '+22%',
        confidence: 78,
        justification: 'Tendência de crescimento em menções negativas sobre saúde pública.',
        factors: [
          { factor: 'Aumento de menções negativas', impact: 'alto' },
          { factor: 'Sazonalidade', impact: 'médio' },
        ],
      },
      {
        metric: 'engagement_forecast',
        timeframe: '14d',
        predicted_value: '+8%',
        confidence: 65,
        justification: 'Crescimento moderado esperado com novas publicações sobre obras.',
        factors: [{ factor: 'Conteúdo programado', impact: 'médio' }],
      },
      {
        metric: 'crisis_probability',
        timeframe: '30d',
        predicted_value: 'Médio',
        confidence: 55,
        justification: 'Risco de formação de crise em saúde persiste se não houver posicionamento.',
        factors: [
          { factor: 'Polaridade negativa', impact: 'alto' },
          { factor: 'Demandas não atendidas', impact: 'alto' },
        ],
      },
    ]
    for (const p of preds) {
      try {
        app.findFirstRecordByData('predictions', 'metric', p.metric)
      } catch (_) {
        const r = new Record(predCol)
        r.set('metric', p.metric)
        r.set('timeframe', p.timeframe)
        r.set('predicted_value', p.predicted_value)
        r.set('confidence', p.confidence)
        r.set('factors', p.factors)
        r.set('justification', p.justification)
        app.save(r)
      }
    }

    const insightCol = app.findCollectionByNameOrId('strategic_insights')
    const insights = [
      {
        module: 'market',
        title: 'Crescimento de debates sobre segurança pública',
        summary: 'Aumento de 40% em menções sobre segurança nas últimas duas semanas.',
        type: 'trend',
        confidence: 80,
      },
      {
        module: 'market',
        title: 'Oportunidade: pauta sobre iluminação em LED',
        summary:
          'Alto engajamento em posts sobre iluminação pública. Janela de oportunidade para conteúdo.',
        type: 'opportunity',
        confidence: 72,
      },
      {
        module: 'image',
        title: 'Risco: inconsistência no tom institucional',
        summary: 'Variação entre tom técnico e informal pode confundir o público.',
        type: 'risk',
        confidence: 60,
      },
      {
        module: 'image',
        title: 'Recomendação: reforçar pauta de transparência',
        summary: 'Conteúdos sobre prestação de contas têm 2x mais engajamento.',
        type: 'insight',
        confidence: 85,
      },
      {
        module: 'social',
        title: 'Tópico emergente: filas em UBS',
        summary: 'Termo "filas ubs" cresceu 2.8x em volume de menções.',
        type: 'trend',
        confidence: 90,
      },
    ]
    for (const s of insights) {
      try {
        app.findFirstRecordByData('strategic_insights', 'title', s.title)
      } catch (_) {
        const r = new Record(insightCol)
        r.set('module', s.module)
        r.set('title', s.title)
        r.set('summary', s.summary)
        r.set('type', s.type)
        r.set('confidence', s.confidence)
        r.set('source_data', {})
        app.save(r)
      }
    }

    const topicCol = app.findCollectionByNameOrId('social_topics')
    const topics = [
      { term: '#SaúdePública', type: 'hashtag' },
      { term: 'posto de saúde', type: 'keyword' },
      { term: 'Vereador NIM', type: 'name' },
      { term: 'projeto de lei 1234', type: 'project' },
      { term: 'Jardim América', type: 'city' },
      { term: 'Secretaria de Saúde', type: 'secretary' },
      { term: 'Programa Mais Educação', type: 'program' },
      { term: 'Política de Iluminação', type: 'policy' },
      { term: 'Sessão Plenária', type: 'event' },
      { term: 'Assessor NIM', type: 'nickname' },
    ]
    for (const t of topics) {
      try {
        app.findFirstRecordByData('social_topics', 'term', t.term)
      } catch (_) {
        const r = new Record(topicCol)
        r.set('term', t.term)
        r.set('type', t.type)
        r.set('active', true)
        app.save(r)
      }
    }

    try {
      $ai.agents.define(app, {
        slug: 'nim-copiloto',
        name: 'Executive Copilot',
        description: 'Copiloto executivo para inteligência política e comunicação estratégica.',
        systemPrompt:
          'Você é o Copiloto Executivo do NIM, um conselheiro sênior de comunicação estratégica e inteligência política. Suas respostas são fundamentadas exclusivamente nos dados do projeto (escuta social, alertas de crise, métricas de audiência, reputação, conteúdo, predições e insights estratégicos). Para análises preditivas, sempre indique o nível de confiança e cite as fontes dos dados. Explique o raciocínio por trás de cada recomendação. Se não houver dados suficientes, diga claramente.',
        tier: 'fast',
        tools: [
          'audience_snapshots',
          'competitive_actors',
          'competitive_snapshots',
          'content_items',
          'reputation_scores',
          'brand_attributes',
          'predictions',
          'strategic_insights',
          'social_topics',
          'vtracker_snapshots',
          'demands',
          'crisis_alerts',
          'speeches',
          'retention_scripts',
        ].map(function (col) {
          return { collection: col, perms: { read: true, list: true } }
        }),
        memory: [
          {
            type: 'text',
            payload: {
              text: 'PRS (Political Reputation Score) é composto por: Sentiment (-1 a 1 normalizado para 0-100), Reach (0-100), Engagement (0-100), Trust (0-100), Authority (0-100), Mention Frequency (0-100), Polarization (0-1), Growth Speed (0-100), Regional Influence (0-100). Score final é média ponderada normalizada para 0-100.',
            },
          },
          {
            type: 'text',
            payload: {
              text: 'Share of Voice (SoV) = menções do político / total de menções na categoria. Share of Attention (SoA) = engajamento do político / engajamento total na categoria.',
            },
          },
          {
            type: 'text',
            payload: {
              text: 'Severidade de crise: baixa (anomalia <2x baseline), média (2-3x), alta (3-4x ou >350 menções negativas), crítica (>4x ou >500 menções negativas ou polaridade < -0.3).',
            },
          },
        ],
      })
    } catch (err) {
      console.log('Copilot agent definition warning: ' + err.message)
    }
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'nim-copiloto')
    } catch (_) {}
  },
)
