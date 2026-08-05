migrate(
  (app) => {
    const R = "@request.auth.id != ''"
    const AD = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    app.save(
      new Collection({
        name: 'audience_snapshots',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'date', type: 'date' },
          { name: 'platform', type: 'text' },
          { name: 'followers', type: 'number' },
          { name: 'reach', type: 'number' },
          { name: 'impressions', type: 'number' },
          { name: 'engagement', type: 'number' },
          { name: 'engagement_rate', type: 'number' },
          { name: 'shares', type: 'number' },
          { name: 'video_completion_rate', type: 'number' },
          { name: 'ctr', type: 'number' },
          { name: 'sentiment', type: 'number' },
          ...AD,
        ],
        indexes: [
          'CREATE INDEX idx_audience_date ON audience_snapshots (date)',
          'CREATE INDEX idx_audience_platform ON audience_snapshots (platform)',
        ],
      }),
    )

    const actorsCol = new Collection({
      name: 'competitive_actors',
      type: 'base',
      listRule: R,
      viewRule: R,
      createRule: R,
      updateRule: R,
      deleteRule: R,
      fields: [
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'platforms', type: 'json' },
        { name: 'active', type: 'bool' },
        ...AD,
      ],
    })
    app.save(actorsCol)

    app.save(
      new Collection({
        name: 'competitive_snapshots',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'actor', type: 'relation', collectionId: actorsCol.id, maxSelect: 1 },
          { name: 'date', type: 'date' },
          { name: 'platform', type: 'text' },
          { name: 'posts_count', type: 'number' },
          { name: 'engagement', type: 'number' },
          { name: 'estimated_reach', type: 'number' },
          { name: 'audiences', type: 'number' },
          { name: 'top_themes', type: 'json' },
          ...AD,
        ],
        indexes: [
          'CREATE INDEX idx_comp_snap_actor ON competitive_snapshots (actor)',
          'CREATE INDEX idx_comp_snap_date ON competitive_snapshots (date)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'content_items',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'title', type: 'text' },
          {
            name: 'type',
            type: 'select',
            values: [
              'reels',
              'tiktok',
              'stories',
              'carousel',
              'post',
              'threads',
              'twitter',
              'facebook',
              'linkedin',
              'youtube',
              'shorts',
              'whatsapp',
              'telegram',
              'site',
              'newsletter',
            ],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: [
              'idea',
              'briefing',
              'research',
              'draft',
              'review',
              'approval',
              'scheduling',
              'published',
              'performance',
              'archived',
            ],
            maxSelect: 1,
          },
          { name: 'idea', type: 'text' },
          { name: 'briefing', type: 'text' },
          { name: 'draft', type: 'text' },
          { name: 'campaign', type: 'text' },
          { name: 'channel', type: 'text' },
          { name: 'scheduled_at', type: 'date' },
          { name: 'published_at', type: 'date' },
          { name: 'performance', type: 'json' },
          ...AD,
        ],
        indexes: [
          'CREATE INDEX idx_content_status ON content_items (status)',
          'CREATE INDEX idx_content_type ON content_items (type)',
          'CREATE INDEX idx_content_scheduled ON content_items (scheduled_at)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'reputation_scores',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'date', type: 'date' },
          { name: 'prs_score', type: 'number' },
          { name: 'sentiment', type: 'number' },
          { name: 'reach', type: 'number' },
          { name: 'engagement', type: 'number' },
          { name: 'trust', type: 'number' },
          { name: 'authority', type: 'number' },
          { name: 'mention_frequency', type: 'number' },
          { name: 'polarization', type: 'number' },
          { name: 'growth_speed', type: 'number' },
          { name: 'regional_influence', type: 'number' },
          ...AD,
        ],
        indexes: ['CREATE INDEX idx_reputation_date ON reputation_scores (date)'],
      }),
    )

    app.save(
      new Collection({
        name: 'brand_attributes',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'attribute', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'strength', type: 'number' },
          { name: 'sentiment', type: 'number' },
          { name: 'period', type: 'text' },
          ...AD,
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'predictions',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'metric', type: 'text' },
          { name: 'timeframe', type: 'text' },
          { name: 'predicted_value', type: 'text' },
          { name: 'confidence', type: 'number' },
          { name: 'factors', type: 'json' },
          { name: 'justification', type: 'text' },
          ...AD,
        ],
        indexes: ['CREATE INDEX idx_predictions_metric ON predictions (metric)'],
      }),
    )

    app.save(
      new Collection({
        name: 'strategic_insights',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'module', type: 'text' },
          { name: 'title', type: 'text' },
          { name: 'summary', type: 'text' },
          {
            name: 'type',
            type: 'select',
            values: ['opportunity', 'risk', 'trend', 'insight'],
            maxSelect: 1,
          },
          { name: 'confidence', type: 'number' },
          { name: 'source_data', type: 'json' },
          ...AD,
        ],
        indexes: [
          'CREATE INDEX idx_insights_module ON strategic_insights (module)',
          'CREATE INDEX idx_insights_type ON strategic_insights (type)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'social_topics',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'term', type: 'text' },
          {
            name: 'type',
            type: 'select',
            values: [
              'hashtag',
              'keyword',
              'name',
              'nickname',
              'project',
              'event',
              'city',
              'secretary',
              'program',
              'policy',
            ],
            maxSelect: 1,
          },
          { name: 'active', type: 'bool' },
          ...AD,
        ],
        indexes: ['CREATE INDEX idx_topics_type ON social_topics (type)'],
      }),
    )

    const crisisCol = app.findCollectionByNameOrId('crisis_alerts')
    const newFields = [
      ['executive_summary', 'text'],
      ['timeline', 'json'],
      ['risk_estimate', 'number'],
      ['potential_reach', 'number'],
      ['main_concerns', 'json'],
      ['recurring_questions', 'json'],
      ['faq', 'json'],
      ['communication_plan', 'text'],
      ['response_schedule', 'json'],
      ['operational_checklist', 'json'],
    ]
    for (const [name, type] of newFields) {
      if (!crisisCol.fields.getByName(name)) {
        if (type === 'text') crisisCol.fields.add(new TextField({ name }))
        else if (type === 'number') crisisCol.fields.add(new NumberField({ name }))
        else if (type === 'json') crisisCol.fields.add(new JSONField({ name }))
      }
    }
    app.save(crisisCol)
  },
  (app) => {
    const cols = [
      'social_topics',
      'strategic_insights',
      'predictions',
      'brand_attributes',
      'reputation_scores',
      'content_items',
      'competitive_snapshots',
      'competitive_actors',
      'audience_snapshots',
    ]
    for (const name of cols) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {}
    }
  },
)
