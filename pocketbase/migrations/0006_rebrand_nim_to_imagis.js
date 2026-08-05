migrate(
  (app) => {
    function rebrandString(str) {
      if (typeof str !== 'string' || str === '') return str
      var r = str
      r = r.split('Núcleo de Inteligência de Mandato').join('Imagis')
      r = r.split('Motor NIM').join('Motor Imagis')
      r = r.split('Agente NIM').join('Agente Imagis')
      r = r.split('Assistente NIM').join('Assistente Imagis')
      r = r.split('Analista NIM').join('Analista Imagis')
      r = r.split('Copiloto Executivo do NIM').join('Copiloto Executivo do Imagis')
      r = r.split('nim-analista').join('imagis-analista')
      r = r.split('nim-copiloto').join('imagis-copiloto')
      r = r.split('motor_nim').join('motor_imagis')
      r = r.split('CÓRTEX').join('Imagis')
      r = r.split('Cortex').join('Imagis')
      r = r.split('NIM').join('Imagis')
      return r
    }

    function needsRebrand(str) {
      if (typeof str !== 'string') return false
      var l = str.toLowerCase()
      return l.indexOf('nim') !== -1 || l.indexOf('cortex') !== -1
    }

    function rebrandJson(val) {
      if (val === null || val === undefined) return val
      if (typeof val === 'string') return rebrandString(val)
      if (Array.isArray(val)) {
        var changed = false
        var newArr = val.map(function (v) {
          var nv = rebrandJson(v)
          if (nv !== v) changed = true
          return nv
        })
        return changed ? newArr : val
      }
      if (typeof val === 'object') {
        var changed = false
        var newObj = {}
        for (var k in val) {
          if (!val.hasOwnProperty(k)) continue
          var nv = rebrandJson(val[k])
          if (nv !== val[k]) changed = true
          newObj[k] = nv
        }
        return changed ? newObj : val
      }
      return val
    }

    try {
      var oldSettings = app.findFirstRecordByData('settings', 'key', 'motor_nim')
      if (oldSettings) {
        var oldVal = oldSettings.get('value')
        if (typeof oldVal === 'string') {
          try {
            oldVal = JSON.parse(oldVal)
          } catch (_) {}
        }
        oldVal = rebrandJson(oldVal)
        oldSettings.set('key', 'motor_imagis')
        oldSettings.set('value', oldVal)
        app.saveNoValidate(oldSettings)
      }
    } catch (_) {}

    try {
      var brandRec = app.findFirstRecordByData('settings', 'key', 'brand_identity')
      if (brandRec) {
        var brandVal = brandRec.get('value')
        if (typeof brandVal === 'string') {
          try {
            brandVal = JSON.parse(brandVal)
          } catch (_) {}
        }
        if (brandVal && typeof brandVal === 'object') {
          brandVal.slogan =
            'Imagis — Inteligência Estratégica para Comunicação Institucional, Gestão de Reputação e Apoio à Decisão Baseado em Dados'
        }
        brandVal = rebrandJson(brandVal)
        brandRec.set('value', brandVal)
        app.saveNoValidate(brandRec)
      }
    } catch (_) {}

    try {
      $ai.agents.define(app, {
        slug: 'imagis-analista',
        name: 'Analista Imagis',
        description: 'Agente de inteligência para apoio em crises, discursos, roteiros e emendas.',
        systemPrompt:
          'Você é o Analista Imagis, um assistente inteligente e estratégico para mandatos parlamentares no Brasil. Forneça análises claras, concisas e fundamentadas nos dados de escuta social, alertas de crise, discursos gerados e orçamento público.',
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
      console.log('Agent imagis-analista definition warning: ' + err.message)
    }

    try {
      $ai.agents.define(app, {
        slug: 'imagis-copiloto',
        name: 'Executive Copilot',
        description: 'Copiloto executivo para inteligência política e comunicação estratégica.',
        systemPrompt:
          'Você é o Copiloto Executivo do Imagis, um conselheiro sênior de comunicação estratégica e inteligência política. Suas respostas são fundamentadas exclusivamente nos dados do projeto (escuta social, alertas de crise, métricas de audiência, reputação, conteúdo, predições e insights estratégicos). Para análises preditivas, sempre indique o nível de confiança e cite as fontes dos dados. Explique o raciocínio por trás de cada recomendação. Se não houver dados suficientes, diga claramente.',
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
      console.log('Agent imagis-copiloto definition warning: ' + err.message)
    }

    try {
      $ai.agents.delete(app, 'nim-analista')
    } catch (_) {}
    try {
      $ai.agents.delete(app, 'nim-copiloto')
    } catch (_) {}

    var textFields = {
      crisis_alerts: [
        'summary',
        'causa_raiz',
        'nota_oficial',
        'executive_summary',
        'communication_plan',
      ],
      speeches: ['title', 'tema', 'tom_de_voz', 'content'],
      retention_scripts: [
        'tipo_conteudo',
        'tema',
        'hook',
        'roteiro_detalhado',
        'texto_legenda',
        'tom_de_voz',
      ],
      demands: ['title', 'description', 'category', 'region'],
      budget_items: ['code', 'rubric_name', 'description', 'category'],
      amendment_reports: ['title', 'summary', 'methodology'],
    }

    var jsonFields = {
      crisis_alerts: [
        'trigger_metrics',
        'roteiro_video',
        'payload_whatsapp',
        'timeline',
        'main_concerns',
        'recurring_questions',
        'faq',
        'response_schedule',
        'operational_checklist',
      ],
      speeches: ['pautas', 'structured_meta'],
      retention_scripts: ['hashtags'],
      demands: ['source_terms'],
      budget_items: ['keywords'],
      amendment_reports: ['recommendations'],
    }

    var allCols = Object.keys(textFields).concat(Object.keys(jsonFields))
    var seen = {}
    var uniqueCols = []
    for (var i = 0; i < allCols.length; i++) {
      if (!seen[allCols[i]]) {
        seen[allCols[i]] = true
        uniqueCols.push(allCols[i])
      }
    }

    for (var ci = 0; ci < uniqueCols.length; ci++) {
      var colName = uniqueCols[ci]
      var records = []
      try {
        records = app.findRecordsByFilter(colName, "id != ''", '-created', 100, 0)
      } catch (_) {
        continue
      }

      for (var ri = 0; ri < records.length; ri++) {
        var rec = records[ri]
        var changed = false
        var tFields = textFields[colName] || []
        for (var ti = 0; ti < tFields.length; ti++) {
          try {
            var val = rec.getString(tFields[ti])
            if (needsRebrand(val)) {
              rec.set(tFields[ti], rebrandString(val))
              changed = true
            }
          } catch (_) {}
        }
        var jFields = jsonFields[colName] || []
        for (var ji = 0; ji < jFields.length; ji++) {
          try {
            var jVal = rec.get(jFields[ji])
            if (jVal !== null && jVal !== undefined && jVal !== '') {
              var jValStr = typeof jVal === 'string' ? jVal : JSON.stringify(jVal)
              if (needsRebrand(jValStr)) {
                var parsed = typeof jVal === 'string' ? JSON.parse(jVal) : jVal
                rec.set(jFields[ji], rebrandJson(parsed))
                changed = true
              }
            }
          } catch (_) {}
        }
        if (changed) {
          try {
            app.saveNoValidate(rec)
          } catch (_) {}
        }
      }
    }
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'imagis-analista')
    } catch (_) {}
    try {
      $ai.agents.delete(app, 'imagis-copiloto')
    } catch (_) {}
  },
)
