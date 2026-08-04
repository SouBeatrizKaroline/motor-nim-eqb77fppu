migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Seed default admin user
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', '1aspiraqualquer@gmail.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('1aspiraqualquer@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Assessor NIM')
      app.save(record)
    }

    // Seed settings
    try {
      app.findFirstRecordByData('settings', 'key', 'motor_nim')
    } catch (_) {
      const settingsCol = app.findCollectionByNameOrId('settings')
      const rec = new Record(settingsCol)
      rec.set('key', 'motor_nim')
      rec.set('value', {
        vtracker_url: 'https://api.v-tracker.example.com/v1',
        vtracker_api_key: '',
        vtracker_enabled: true,
        whatsapp_provider: 'webhook',
        whatsapp_webhook_url: 'https://api.whatsapp-provider.example.com/webhook',
        whatsapp_api_token: '',
        default_target_phone: '5511999998888',
        threshold_window_minutes: 30,
        threshold_baseline_hours: 24,
        threshold_multiplier: 2.0,
        threshold_min_negative: 50,
        threshold_polarity_drop: -0.2,
        auto_process: true,
        auto_notify: true,
        speech_system_prompt:
          'Você é um estrategista de comunicação parlamentar experiente. Redija discursos estruturados, articulados e persuasivos para o plenário.',
        script_system_prompt:
          'Você é um especialista em roteiros de redes sociais de alta retenção para Reels/TikTok. Mantenha os ganchos visuais e falas impactantes nos primeiros 3 segundos.',
      })
      app.save(rec)
    }

    // Seed budget items
    const budgetCol = app.findCollectionByNameOrId('budget_items')
    const sampleBudgets = [
      {
        code: 'SAÚDE-001',
        rubric_name: 'Atenção Básica à Saúde',
        description:
          'Reforma e reaparelhamento de Unidades Básicas de Saúde (UBS) e aquisição de insumos médicos.',
        category: 'Saúde',
        year: 2025,
        available_amount: 800000,
        keywords: ['ubs', 'posto de saúde', 'médico', 'insumos', 'remédio'],
      },
      {
        code: 'SAÚDE-002',
        rubric_name: 'Farmácia Básica e Insumos',
        description:
          'Aquisição descentralizada de medicamentos de distribuição gratuita na rede municipal.',
        category: 'Saúde',
        year: 2025,
        available_amount: 450000,
        keywords: ['remédios', 'farmácia', 'insulina', 'medicamento'],
      },
      {
        code: 'PAV-001',
        rubric_name: 'Pavimentação e Recapeamento',
        description:
          'Obras de asfaltamento, operação tapa-buracos e melhorias de vias urbanas de alta circulação.',
        category: 'Infraestrutura',
        year: 2025,
        available_amount: 1200000,
        keywords: ['asfalto', 'buraco', 'pavimentação', 'rua', 'trânsito'],
      },
      {
        code: 'ILUM-001',
        rubric_name: 'Iluminação Pública em LED',
        description:
          'Modernização e instalação de luminárias LED em bairros periféricos e praças públicas.',
        category: 'Infraestrutura',
        year: 2025,
        available_amount: 300000,
        keywords: ['iluminação', 'led', 'escuro', 'segurança', 'praça'],
      },
      {
        code: 'EDUC-001',
        rubric_name: 'Material Didático e Tecnologia',
        description:
          'Distribuição de tablets, notebooks e kits escolares para alunos da rede pública municipal.',
        category: 'Educação',
        year: 2025,
        available_amount: 500000,
        keywords: ['escola', 'tablet', 'material', 'aluno', 'tecnologia'],
      },
      {
        code: 'SAN-001',
        rubric_name: 'Saneamento e Drenagem Urbana',
        description:
          'Canalização de águas pluviais, galerias de esgoto e contenção de enchentes em áreas de risco.',
        category: 'Saneamento',
        year: 2025,
        available_amount: 900000,
        keywords: ['enchente', 'drenagem', 'esgoto', 'chuva', 'alagamento'],
      },
    ]

    for (const b of sampleBudgets) {
      try {
        app.findFirstRecordByData('budget_items', 'code', b.code)
      } catch (_) {
        const rec = new Record(budgetCol)
        rec.set('code', b.code)
        rec.set('rubric_name', b.rubric_name)
        rec.set('description', b.description)
        rec.set('category', b.category)
        rec.set('year', b.year)
        rec.set('available_amount', b.available_amount)
        rec.set('keywords', b.keywords)
        app.save(rec)
      }
    }

    // Seed sample demands
    const demandsCol = app.findCollectionByNameOrId('demands')
    const sampleDemands = [
      {
        title: 'Demora e filas no atendimento do Posto de Saúde Central',
        description:
          'Cidadãos relatam espera superior a 6 horas para consultas básicas e falta de medicamentos de uso contínuo na farmácia popular.',
        category: 'Saúde',
        source_terms: ['posto de saúde', 'espera', 'médico', 'remédio', 'ambulância'],
        negative_volume: 380,
        mentions_count: 520,
        region: 'Zona Norte / Centro',
        first_seen: new Date(Date.now() - 3 * 86400000).toISOString(),
        last_seen: new Date().toISOString(),
      },
      {
        title: 'Cratera na Av. Principal e transtornos no trânsito',
        description:
          'Grandes buracos na via causando acidentes, danos a veículos e lentidão nos horários de pico.',
        category: 'Infraestrutura',
        source_terms: ['buraco', 'asfalto', 'cratera', 'pneu furado', 'trânsito'],
        negative_volume: 240,
        mentions_count: 310,
        region: 'Bairro Jardim América',
        first_seen: new Date(Date.now() - 5 * 86400000).toISOString(),
        last_seen: new Date().toISOString(),
      },
      {
        title: 'Escuridão e falta de iluminação nas praças da Zona Sul',
        description:
          'Postes apagados há semanas gerando insegurança e relatos de furtos no período noturno.',
        category: 'Infraestrutura',
        source_terms: ['iluminação', 'luz apagada', 'assalto', 'praça', 'escuro'],
        negative_volume: 190,
        mentions_count: 260,
        region: 'Zona Sul',
        first_seen: new Date(Date.now() - 2 * 86400000).toISOString(),
        last_seen: new Date().toISOString(),
      },
    ]

    for (const d of sampleDemands) {
      try {
        app.findFirstRecordByData('demands', 'title', d.title)
      } catch (_) {
        const rec = new Record(demandsCol)
        rec.set('title', d.title)
        rec.set('description', d.description)
        rec.set('category', d.category)
        rec.set('source_terms', d.source_terms)
        rec.set('negative_volume', d.negative_volume)
        rec.set('mentions_count', d.mentions_count)
        rec.set('region', d.region)
        rec.set('first_seen', d.first_seen)
        rec.set('last_seen', d.last_seen)
        app.save(rec)
      }
    }

    // Seed vtracker_snapshots
    const snapshotCol = app.findCollectionByNameOrId('vtracker_snapshots')
    const now = Date.now()
    const sampleSnapshots = [
      {
        offset: 6,
        mentions: 450,
        neg: 60,
        pos: 220,
        neu: 170,
        pol: 0.35,
        terms: [{ term: 'obras', delta: 1.1, mentions: 50 }],
      },
      {
        offset: 5,
        mentions: 510,
        neg: 75,
        pos: 230,
        neu: 205,
        pol: 0.3,
        terms: [{ term: 'projeto de lei', delta: 1.2, mentions: 65 }],
      },
      {
        offset: 4,
        mentions: 480,
        neg: 70,
        pos: 210,
        neu: 200,
        pol: 0.29,
        terms: [{ term: 'educação', delta: 1.0, mentions: 40 }],
      },
      {
        offset: 3,
        mentions: 620,
        neg: 110,
        pos: 200,
        neu: 310,
        pol: 0.15,
        terms: [{ term: 'posto de saúde', delta: 1.8, mentions: 90 }],
      },
      {
        offset: 2,
        mentions: 890,
        neg: 280,
        pos: 180,
        neu: 430,
        pol: -0.11,
        terms: [
          { term: 'espera posto', delta: 2.3, mentions: 160 },
          { term: 'ambulância', delta: 2.1, mentions: 120 },
        ],
      },
      {
        offset: 1,
        mentions: 1420,
        neg: 580,
        pos: 150,
        neu: 690,
        pol: -0.3,
        terms: [
          { term: 'falta de médico', delta: 3.5, mentions: 340 },
          { term: 'cratera', delta: 2.4, mentions: 180 },
        ],
      },
      {
        offset: 0,
        mentions: 1280,
        neg: 490,
        pos: 170,
        neu: 620,
        pol: -0.25,
        terms: [
          { term: 'falta de médico', delta: 2.8, mentions: 290 },
          { term: 'filas ubs', delta: 2.2, mentions: 210 },
        ],
      },
    ]

    let latestSnapshotRecord = null
    for (const s of sampleSnapshots) {
      const windowStart = new Date(now - s.offset * 86400000).toISOString()
      const windowEnd = new Date(now - s.offset * 86400000 + 1800000).toISOString()

      const rec = new Record(snapshotCol)
      rec.set('window_start', windowStart)
      rec.set('window_end', windowEnd)
      rec.set('mention_volume', s.mentions)
      rec.set('negative_volume', s.neg)
      rec.set('positive_volume', s.pos)
      rec.set('neutral_volume', s.neu)
      rec.set('polarity_index', s.pol)
      rec.set('emerging_terms', s.terms)
      rec.set('top_posts', [
        {
          author: '@cidadao_atento',
          text: 'Espera de mais de 6 horas no posto de saúde central hoje. Um absurdo total!',
          sentiment: 'negativo',
          engagement: 420,
          source: 'twitter',
          published_at: windowStart,
        },
        {
          author: '@comunidade_zonanorte',
          text: 'Os médicos não chegaram para o plantão da manhã no posto de saúde.',
          sentiment: 'negativo',
          engagement: 310,
          source: 'instagram',
          published_at: windowStart,
        },
      ])
      rec.set('source_raw', { provider: 'V-Tracker', status: 'OK' })
      app.save(rec)
      if (s.offset === 0) latestSnapshotRecord = rec
    }

    // Seed sample crisis alert
    if (latestSnapshotRecord) {
      const crisisCol = app.findCollectionByNameOrId('crisis_alerts')
      try {
        app.findFirstRecordByData('crisis_alerts', 'severity', 'alta')
      } catch (_) {
        const alertRec = new Record(crisisCol)
        alertRec.set(
          'summary',
          'Pico anômalo de menções negativas sobre falta de médicos e espera no Posto de Saúde Central',
        )
        alertRec.set('severity', 'alta')
        alertRec.set('status', 'nota_pronta')
        alertRec.set('trigger_metrics', {
          window_negative: 490,
          baseline_negative: 70,
          increase_ratio: '7.0x',
          polarity_drop: -0.54,
        })
        alertRec.set('related_snapshot', latestSnapshotRecord.id)
        alertRec.set(
          'causa_raiz',
          'Falta inesperada de dois médicos plantonistas na UBS Central no início do turno da manhã.',
        )
        alertRec.set(
          'nota_oficial',
          'NOTA OFICIAL — MANDATO PARLAMENTAR\n\nDiante dos relatos recebidos sobre o tempo de espera no Posto de Saúde Central, informamos que enviamos requerimento urgente de fiscalização e cobrança imediata à Secretaria de Saúde para remanejamento de plantonistas.',
        )
        alertRec.set('roteiro_video', {
          hook: 'Você esperou horas no posto de saúde hoje? Veja o que nosso mandato já está fazendo!',
          declaracao_central:
            'Exigimos da Prefeitura e da Secretaria de Saúde a reposição imediata dos médicos ausentes no plantão.',
          fechamento:
            'Acompanhe nossas redes. Não aceitaremos o descaso com a saúde da nossa gente.',
          duracao_segundos: 45,
        })
        alertRec.set('payload_whatsapp', {
          para: '5511999998888',
          tipo: 'alerta_crise',
          mensagem:
            '🚨 ALERTA DE CRISE EM SAÚDE\n\nFoi identificada alta no volume negativo sobre o Posto de Saúde Central. Nota e vídeo de resposta rápida já disponíveis.',
          metadados: { causa: 'UBS Central' },
        })
        alertRec.set('sent_status', 'pendente')
        app.save(alertRec)
      }
    }

    // Define Skip Agent: Analista NIM
    try {
      $ai.agents.define(app, {
        slug: 'nim-analista',
        name: 'Analista NIM',
        description:
          'Agente de inteligência de mandato para apoio em crises, discursos, roteiros e emendas.',
        systemPrompt:
          'Você é o Analista NIM, um assistente inteligente e estratégico para mandatos parlamentares no Brasil. Forneça análises claras, concisas e fundamentadas nos dados de escuta social, alertas de crise, discursos gerados e orçamento público.',
        tier: 'fast',
        tools: [
          { collection: 'crisis_alerts', perms: { read: true, list: true } },
          { collection: 'vtracker_snapshots', perms: { read: true, list: true } },
          { collection: 'speeches', perms: { read: true, list: true } },
          { collection: 'retention_scripts', perms: { read: true, list: true } },
          { collection: 'amendment_reports', perms: { read: true, list: true } },
          { collection: 'budget_items', perms: { read: true, list: true } },
        ],
      })
    } catch (err) {
      console.log('Agent definition warning: ' + err.message)
    }
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'nim-analista')
    } catch (_) {}
  },
)
