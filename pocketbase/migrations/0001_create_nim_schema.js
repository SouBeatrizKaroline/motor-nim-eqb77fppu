migrate(
  (app) => {
    const authRule = "@request.auth.id != ''"

    // 1. vtracker_snapshots
    const vtracker = new Collection({
      name: 'vtracker_snapshots',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'window_start', type: 'date' },
        { name: 'window_end', type: 'date' },
        { name: 'mention_volume', type: 'number' },
        { name: 'negative_volume', type: 'number' },
        { name: 'positive_volume', type: 'number' },
        { name: 'neutral_volume', type: 'number' },
        { name: 'polarity_index', type: 'number' },
        { name: 'emerging_terms', type: 'json' },
        { name: 'top_posts', type: 'json' },
        { name: 'source_raw', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_vt_start ON vtracker_snapshots (window_start)',
        'CREATE INDEX idx_vt_created ON vtracker_snapshots (created DESC)',
      ],
    })
    app.save(vtracker)

    // 2. crisis_alerts
    const crisis = new Collection({
      name: 'crisis_alerts',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'summary', type: 'text' },
        {
          name: 'severity',
          type: 'select',
          values: ['baixa', 'média', 'alta', 'crítica'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: [
            'detectado',
            'processando',
            'nota_pronta',
            'roteiro_pronto',
            'notificado',
            'resolvido',
            'descartado',
          ],
          maxSelect: 1,
        },
        { name: 'trigger_metrics', type: 'json' },
        { name: 'related_snapshot', type: 'relation', collectionId: vtracker.id, maxSelect: 1 },
        { name: 'causa_raiz', type: 'text' },
        { name: 'nota_oficial', type: 'text' },
        { name: 'roteiro_video', type: 'json' },
        { name: 'payload_whatsapp', type: 'json' },
        {
          name: 'sent_status',
          type: 'select',
          values: ['pendente', 'enviado', 'falhou', 'manual'],
          maxSelect: 1,
        },
        { name: 'sent_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_crisis_status ON crisis_alerts (status)',
        'CREATE INDEX idx_crisis_created ON crisis_alerts (created DESC)',
      ],
    })
    app.save(crisis)

    // 3. speeches
    const speeches = new Collection({
      name: 'speeches',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'title', type: 'text' },
        { name: 'tema', type: 'text' },
        { name: 'tom_de_voz', type: 'text' },
        { name: 'duracao_minutos', type: 'number' },
        { name: 'pautas', type: 'json' },
        { name: 'content', type: 'text' },
        { name: 'structured_meta', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_speeches_created ON speeches (created DESC)'],
    })
    app.save(speeches)

    // 4. retention_scripts
    const scripts = new Collection({
      name: 'retention_scripts',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'platform', type: 'select', values: ['reels', 'tiktok', 'shorts'], maxSelect: 1 },
        { name: 'tipo_conteudo', type: 'text' },
        { name: 'tema', type: 'text' },
        { name: 'hook', type: 'text' },
        { name: 'roteiro_detalhado', type: 'text' },
        { name: 'texto_legenda', type: 'text' },
        { name: 'hashtags', type: 'json' },
        { name: 'tom_de_voz', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_scripts_platform ON retention_scripts (platform)',
        'CREATE INDEX idx_scripts_created ON retention_scripts (created DESC)',
      ],
    })
    app.save(scripts)

    // 5. demands
    const demands = new Collection({
      name: 'demands',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'source_terms', type: 'json' },
        { name: 'negative_volume', type: 'number' },
        { name: 'mentions_count', type: 'number' },
        { name: 'region', type: 'text' },
        { name: 'first_seen', type: 'date' },
        { name: 'last_seen', type: 'date' },
        { name: 'embedding', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_demands_cat ON demands (category)'],
    })
    app.save(demands)

    // 6. budget_items
    const budget = new Collection({
      name: 'budget_items',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'code', type: 'text' },
        { name: 'rubric_name', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'year', type: 'number' },
        { name: 'available_amount', type: 'number' },
        { name: 'keywords', type: 'json' },
        { name: 'embedding', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_budget_code ON budget_items (code)',
        'CREATE INDEX idx_budget_cat ON budget_items (category)',
      ],
    })
    app.save(budget)

    // 7. amendment_reports
    const amendments = new Collection({
      name: 'amendment_reports',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'title', type: 'text' },
        { name: 'summary', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'methodology', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_amendments_created ON amendment_reports (created DESC)'],
    })
    app.save(amendments)

    // 8. pipeline_runs
    const pipeline = new Collection({
      name: 'pipeline_runs',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        {
          name: 'pipeline',
          type: 'select',
          values: ['crise', 'discurso', 'roteiro', 'emenda'],
          maxSelect: 1,
        },
        { name: 'trigger', type: 'select', values: ['cron', 'manual', 'api'], maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['executando', 'sucesso', 'falha'],
          maxSelect: 1,
        },
        { name: 'stage', type: 'text' },
        { name: 'input', type: 'json' },
        { name: 'output', type: 'json' },
        { name: 'error', type: 'text' },
        { name: 'started_at', type: 'date' },
        { name: 'finished_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pipe_status ON pipeline_runs (status)',
        'CREATE INDEX idx_pipe_created ON pipeline_runs (created DESC)',
      ],
    })
    app.save(pipeline)

    // 9. notifications
    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        {
          name: 'channel',
          type: 'select',
          values: ['whatsapp', 'webhook', 'manual'],
          maxSelect: 1,
        },
        { name: 'target', type: 'text' },
        { name: 'payload', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'enviado', 'falhou', 'manual'],
          maxSelect: 1,
        },
        { name: 'provider', type: 'text' },
        { name: 'error', type: 'text' },
        { name: 'related_type', type: 'text' },
        { name: 'related_id', type: 'text' },
        { name: 'sent_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notif_status ON notifications (status)',
        'CREATE INDEX idx_notif_created ON notifications (created DESC)',
      ],
    })
    app.save(notifications)

    // 10. settings
    const settings = new Collection({
      name: 'settings',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: authRule,
      deleteRule: authRule,
      fields: [
        { name: 'key', type: 'text' },
        { name: 'value', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_settings_key ON settings (key)'],
    })
    app.save(settings)
  },
  (app) => {
    const collections = [
      'settings',
      'notifications',
      'pipeline_runs',
      'amendment_reports',
      'budget_items',
      'demands',
      'retention_scripts',
      'speeches',
      'crisis_alerts',
      'vtracker_snapshots',
    ]
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
