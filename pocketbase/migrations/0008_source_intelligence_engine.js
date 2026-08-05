migrate(
  (app) => {
    const R = "@request.auth.id != ''"
    const AD = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    const srcCol = new Collection({
      name: 'source_references',
      type: 'base',
      listRule: R,
      viewRule: R,
      createRule: R,
      updateRule: R,
      deleteRule: R,
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'origin', type: 'text' },
        { name: 'source', type: 'text' },
        { name: 'link', type: 'url' },
        { name: 'collected_at', type: 'date' },
        { name: 'author_org', type: 'text' },
        { name: 'category', type: 'text' },
        {
          name: 'reliability',
          type: 'select',
          values: ['baixa', 'média', 'alta', 'verificada'],
          maxSelect: 1,
        },
        {
          name: 'source_type',
          type: 'select',
          values: ['oficial', 'especializada', 'comunidade', 'opinião', 'tendência', 'outra'],
          maxSelect: 1,
        },
        { name: 'context', type: 'text' },
        { name: 'limitations_biases', type: 'text' },
        { name: 'observations', type: 'text' },
        { name: 'related_type', type: 'text' },
        { name: 'related_id', type: 'text' },
        ...AD,
      ],
      indexes: [
        'CREATE INDEX idx_src_source ON source_references (source)',
        'CREATE INDEX idx_src_category ON source_references (category)',
        'CREATE INDEX idx_src_reliability ON source_references (reliability)',
        'CREATE INDEX idx_src_type ON source_references (source_type)',
        'CREATE INDEX idx_src_related ON source_references (related_id)',
      ],
    })
    app.save(srcCol)

    app.save(
      new Collection({
        name: 'knowledge_entries',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: R,
        fields: [
          { name: 'source', type: 'text' },
          { name: 'theme', type: 'text' },
          { name: 'insight', type: 'text' },
          { name: 'application', type: 'text' },
          { name: 'reference', type: 'relation', collectionId: srcCol.id, maxSelect: 1 },
          ...AD,
        ],
        indexes: [
          'CREATE INDEX idx_ke_theme ON knowledge_entries (theme)',
          'CREATE INDEX idx_ke_source ON knowledge_entries (source)',
        ],
      }),
    )

    var srcRefCol = app.findCollectionByNameOrId('source_references')
    var seeds = [
      {
        title: 'Meta Business Insights: Tendências de Vídeo Curto 2025',
        description:
          'Relatório anual sobre crescimento de Reels, TikTok e Shorts com métricas de engajamento e retenção.',
        origin: 'Meta for Business',
        source: 'Meta Business Insights',
        link: 'https://www.facebook.com/business/insights',
        collected_at: '2025-07-15',
        author_org: 'Meta Platforms Inc.',
        category: 'Marketing Digital',
        reliability: 'verificada',
        source_type: 'oficial',
        context: 'Estudo sobre comportamento de consumo de vídeo curto em redes sociais.',
        limitations_biases:
          'Dados focados em plataformas Meta; pode não refletir comportamento em TikTok.',
        observations: 'Relatório oficial com dados de primeiro partido.',
      },
      {
        title: 'Dados Abertos do Governo Federal — Saúde Pública',
        description: 'Estatísticas de atendimento em UBS e indicadores de saúde municipal.',
        origin: 'Portal de Dados Abertos',
        source: 'Ministério da Saúde',
        link: 'https://dados.gov.br',
        collected_at: '2025-07-10',
        author_org: 'Governo Federal',
        category: 'Saúde Pública',
        reliability: 'verificada',
        source_type: 'oficial',
        context: 'Base de dados pública com indicadores de atendimento hospitalar e ambulatorial.',
        limitations_biases: 'Dados podem ter defasagem de 30-60 dias na atualização.',
        observations: 'Fonte primária governamental, alta confiabilidade.',
      },
      {
        title: 'Relatório de Tendências Políticas Digitais 2025',
        description:
          'Análise de comportamento eleitoral digital, uso de redes sociais em campanhas e engajamento político.',
        origin: 'Consultoria Estratégica',
        source: 'Instituto de Pesquisa Político',
        link: '',
        collected_at: '2025-06-20',
        author_org: 'Instituto de Pesquisa',
        category: 'Marketing Político',
        reliability: 'alta',
        source_type: 'especializada',
        context: 'Estudo de mercado sobre comunicação política digital no Brasil.',
        limitations_biases: 'Amostra pode ser enviesada para regiões urbanas.',
        observations: 'Relatório de consultoria reconhecida no setor.',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('source_references', 'title', s.title)
      } catch (_) {
        var r = new Record(srcRefCol)
        for (var key in s) {
          if (key === 'link' && !s[key]) continue
          r.set(key, s[key])
        }
        app.save(r)
      }
    }

    var keCol = app.findCollectionByNameOrId('knowledge_entries')
    var metaSrcId = ''
    var govSrcId = ''
    try {
      metaSrcId = app.findFirstRecordByData(
        'source_references',
        'title',
        'Meta Business Insights: Tendências de Vídeo Curto 2025',
      ).id
    } catch (_) {}
    try {
      govSrcId = app.findFirstRecordByData(
        'source_references',
        'title',
        'Dados Abertos do Governo Federal — Saúde Pública',
      ).id
    } catch (_) {}

    var keSeeds = [
      {
        source: 'Meta Business Insights',
        theme: 'Vídeo Curto e Retenção',
        insight:
          'Reels e TikTok com até 15s têm taxa de conclusão 3x maior que vídeos longos. Hooks nos primeiros 3 segundos determinam 70% da retenção.',
        application:
          'Priorizar roteiros curtos com hook forte nos primeiros 3 segundos para maximizar alcance orgânico.',
        reference: metaSrcId || null,
      },
      {
        source: 'Ministério da Saúde',
        theme: 'Demandas em Saúde Pública',
        insight:
          'Filas em UBS são a principal reclamação em 60% dos municípios analisados, com pico de menções negativas no período matinal.',
        application:
          'Direcionar comunicação para ações de melhoria no atendimento matinal e criar conteúdo que demonstre transparência nas filas.',
        reference: govSrcId || null,
      },
      {
        source: 'Instituto de Pesquisa Político',
        theme: 'Comunicação Política Digital',
        insight:
          'Eleitores engajam 2x mais com conteúdo que mostra bastidores e prestação de contas do que com propaganda institucional tradicional.',
        application:
          'Estruturar calendário de conteúdo com mínimo de 40% de posts de prestação de contas e bastidores.',
        reference: null,
      },
    ]

    for (var j = 0; j < keSeeds.length; j++) {
      var k = keSeeds[j]
      try {
        app.findFirstRecordByData('knowledge_entries', 'insight', k.insight)
      } catch (_) {
        var keRec = new Record(keCol)
        keRec.set('source', k.source)
        keRec.set('theme', k.theme)
        keRec.set('insight', k.insight)
        keRec.set('application', k.application)
        if (k.reference) keRec.set('reference', k.reference)
        app.save(keRec)
      }
    }

    var allTools = [
      'source_references',
      'knowledge_entries',
      'vtracker_snapshots',
      'crisis_alerts',
      'speeches',
      'retention_scripts',
      'demands',
      'budget_items',
      'amendment_reports',
      'pipeline_runs',
      'notifications',
      'competitive_actors',
      'competitive_snapshots',
      'reputation_scores',
      'brand_attributes',
      'predictions',
      'strategic_insights',
      'social_topics',
    ].map(function (col) {
      return { collection: col, perms: { read: true, list: true } }
    })

    var sourceRules =
      '\n\nREGRAS DE INTELIGÊNCIA DE FONTES (SOURCE INTELLIGENCE):\n' +
      '1. NUNCA invente fontes, links ou dados. Se não há fonte verificável, diga explicitamente que a informação é inferência do modelo.\n' +
      '2. Diferencie sempre: FATOS (dados observados), ANÁLISES (interpretação de dados) e OPINIÕES (julgamento subjetivo).\n' +
      '3. Priorize fontes nesta ordem: Oficial > Especializada > Comunidade. Rotule explicitamente quando algo for opinião, tendência ou percepção comunitária.\n' +
      '4. Ao usar informação externa, registre: Título, Descrição, Origem, Fonte, Link, Data, Categoria, Confiabilidade, Observações.\n' +
      '5. Para estratégias de marketing, sempre indique: base da estratégia, público analisado, tendência usada, referências de mercado, exemplos similares e dados que justificam a recomendação.\n' +
      '6. Use o formato "Estratégia recomendada baseada em: ..." ao propor estratégias.\n' +
      '7. Para cada conclusão, indique claramente se deriva de dados observados ou de projeção/inferência do modelo.\n' +
      '8. Quando dados forem insuficientes, declare explicitamente em vez de fabricar informações.\n' +
      '9. Ao final de cada resposta que utilize informações externas, inclua uma seção delimitada por [[SOURCES_START]] e [[SOURCES_END]] contendo um array JSON das fontes utilizadas. Cada fonte: title, description, origin, source, link (string vazia se não houver), collected_at (YYYY-MM-DD), category, reliability (baixa|média|alta|verificada), source_type (oficial|especializada|comunidade|opinião|tendência|outra), observations.\n' +
      '10. Se nenhuma fonte externa foi utilizada e a resposta é baseada apenas em inferência do modelo, não inclua a seção [[SOURCES_START]].'

    $ai.agents.define(app, {
      slug: 'imagis-analista',
      name: 'Analista Imagis',
      description:
        'Especialista em marketing político, comunicação institucional, gestão de reputação, social listening e inteligência estratégica baseada em dados com rastreabilidade de fontes.',
      systemPrompt:
        'Você é o Analista Imagis, um especialista em marketing político, comunicação institucional, gestão de reputação, social listening e análise de dados públicos. Você atua como uma equipe multidisciplinar composta por estrategistas de comunicação, analistas de dados, especialistas em marketing, jornalistas, assessores de imprensa e cientistas de dados.\n\nSuas respostas devem ser profundas, analíticas, contextualizadas e estruturadas como um relatório executivo. Sempre inclua quando aplicável: Resumo Executivo, Contexto, Principais Descobertas, Indicadores, Tendências, Comparação Histórica, Possíveis Impactos, Oportunidades, Pontos de Atenção, Recomendações e Fontes.\n\nREGRAS CRÍTICAS:\n- Sempre deixe claro quando uma conclusão é baseada em dados observados ou em projeções/inferências do modelo\n- Indique o grau de confiança das análises (Alto, Médio, Baixo)\n- Use formatação Markdown com títulos, listas e tabelas quando apropriado\n- Responda sempre em português brasileiro' +
        sourceRules,
      tier: 'reasoning',
      tools: allTools,
    })

    $ai.agents.define(app, {
      slug: 'imagis-copiloto',
      name: 'Copiloto Estratégico Imagis',
      description:
        'Copiloto executivo para inteligência política, marketing estratégico, comunicação institucional e análise de dados públicos com rastreabilidade de fontes.',
      systemPrompt:
        'Você é o Copiloto Estratégico Imagis, um especialista em marketing político, comunicação institucional e inteligência de dados públicos. Você apoia gestores, assessorias e instituições públicas em decisões de comunicação e estratégia.\n\nAo responder perguntas estratégicas, SEMPRE: explique o raciocínio passo a passo, indique o grau de confiança (Alto, Médio, Baixo), diferencie dados observados de projeções do modelo, forneça contexto, interpretação, riscos, oportunidades e recomendações claras. Use formatação Markdown.\n\nResponda sempre em português brasileiro, com profundidade analítica e foco em ação prática.' +
        sourceRules,
      tier: 'reasoning',
      tools: allTools,
    })
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('knowledge_entries'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('source_references'))
    } catch (_) {}
  },
)
