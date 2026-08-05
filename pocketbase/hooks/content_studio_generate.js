routerAdd(
  'POST',
  '/backend/v1/content-studio/generate',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const contentType = body.content_type || 'comunicado'
      const platform = body.platform || 'instagram'
      const topic = body.topic || ''
      const tomVoz = body.tom_de_voz || 'institucional'
      const contexto = body.contexto || ''
      const publicoAlvo = body.publico_alvo || ''

      if (!topic.trim()) return e.badRequestError('O tema e obrigatorio.')

      var ctLabels = {
        comunicado: 'comunicado oficial',
        nota_oficial: 'nota oficial',
        pronunciamento: 'pronunciamento',
        discurso: 'discurso',
        artigo: 'artigo',
        release: 'release',
        legenda: 'legenda',
        threads: 'threads',
        newsletter: 'newsletter',
        roteiro_video: 'roteiro para video',
        faq: 'FAQ',
        email: 'e-mail',
        resumo_executivo: 'resumo executivo',
        texto_whatsapp: 'texto para WhatsApp',
        carrossel: 'carrossel',
      }
      var pLabels = {
        instagram: 'Instagram',
        facebook: 'Facebook',
        threads: 'Threads',
        linkedin: 'LinkedIn',
        youtube: 'YouTube',
        tiktok: 'TikTok',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        x: 'X (Twitter)',
        site: 'Site',
        newsletter: 'Newsletter',
      }
      var typeMap = {
        instagram: 'post',
        facebook: 'facebook',
        threads: 'threads',
        linkedin: 'linkedin',
        youtube: 'youtube',
        tiktok: 'tiktok',
        whatsapp: 'whatsapp',
        telegram: 'telegram',
        x: 'twitter',
        site: 'site',
        newsletter: 'newsletter',
      }

      var ctLabel = ctLabels[contentType] || contentType
      var pLabel = pLabels[platform] || platform

      var schema = ''
      if (contentType === 'carrossel') {
        schema =
          '{"titulo":"...","slides":[{"slide":1,"titulo":"Hook","texto":"...","imagem_sugestao":"..."},{"slide":2,"titulo":"...","texto":"...","imagem_sugestao":"..."}],"cta":"...","hashtags":["#..."],"justificativa":"...","fontes_contexto":["..."]}'
      } else {
        schema =
          '{"titulo":"...","conteudo_curto":"Versao curta ate 500 chars","conteudo_medio":"Versao media 500-1500 chars","conteudo_longo":"Versao completa","hashtags":["#..."],"cta":"Chamada para acao","palavras_chave":["..."],"tempo_leitura":"X min","justificativa":"Por que este conteudo e relevante","fontes_contexto":["..."]}'
      }

      var prompt =
        'Voce e um especialista em comunicacao institucional e marketing publico brasileiro.\n' +
        'Gere um ' +
        ctLabel +
        ' para ' +
        pLabel +
        '.\n' +
        'Tema: ' +
        topic +
        '\n' +
        'Tom de voz: ' +
        tomVoz +
        '\n' +
        'Contexto adicional: ' +
        contexto +
        '\n' +
        'Publico-alvo: ' +
        publicoAlvo +
        '\n\n' +
        'Responda ESTRITAMENTE em JSON sem markdown:\n' +
        schema

      var parsed = null
      try {
        var aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Voce e um assessor de comunicacao institucional que responde estritamente em JSON.',
            },
            { role: 'user', content: prompt },
          ],
        })
        var raw = aiRes.choices[0].message.content
        var s = raw.indexOf('{')
        var en = raw.lastIndexOf('}')
        if (s !== -1 && en !== -1) parsed = JSON.parse(raw.substring(s, en + 1))
      } catch (aiErr) {
        $app.logger().error('content studio AI failed', 'error', String(aiErr))
      }

      if (!parsed) {
        parsed = {
          titulo: topic,
          conteudo_curto: 'Conteudo sobre ' + topic,
          conteudo_medio: 'Conteudo institucional sobre ' + topic + '. Em desenvolvimento.',
          conteudo_longo: 'Conteudo institucional sobre ' + topic + '. Em desenvolvimento.',
          hashtags: ['#mandato', '#transparencia'],
          cta: 'Acompanhe nossas redes',
          palavras_chave: [topic],
          tempo_leitura: '1 min',
          justificativa: 'Conteudo gerado a partir do tema solicitado.',
          fontes_contexto: [],
        }
      }

      var col = $app.findCollectionByNameOrId('content_items')
      var rec = new Record(col)
      rec.set('title', parsed.titulo || topic)
      rec.set('type', typeMap[platform] || 'post')
      rec.set('status', 'draft')
      rec.set('idea', contentType)
      rec.set(
        'briefing',
        JSON.stringify({
          topic: topic,
          tom_de_voz: tomVoz,
          contexto: contexto,
          publico_alvo: publicoAlvo,
          hashtags: parsed.hashtags,
          cta: parsed.cta,
          palavras_chave: parsed.palavras_chave,
          tempo_leitura: parsed.tempo_leitura,
          justificativa: parsed.justificativa,
          fontes_contexto: parsed.fontes_contexto,
          slides: parsed.slides || null,
          conteudo_curto: parsed.conteudo_curto || '',
          conteudo_longo: parsed.conteudo_longo || '',
        }),
      )
      rec.set('draft', parsed.conteudo_medio || parsed.conteudo_curto || parsed.titulo || '')
      rec.set('campaign', topic)
      rec.set('channel', platform)
      $app.save(rec)

      try {
        var pipeCol = $app.findCollectionByNameOrId('pipeline_runs')
        var pipeRec = new Record(pipeCol)
        pipeRec.set('pipeline', 'roteiro')
        pipeRec.set('trigger', 'manual')
        pipeRec.set('status', 'sucesso')
        pipeRec.set('stage', 'content studio: ' + ctLabel)
        pipeRec.set('input', { content_type: contentType, platform: platform, topic: topic })
        pipeRec.set('output', { content_id: rec.id })
        pipeRec.set('started_at', new Date().toISOString())
        pipeRec.set('finished_at', new Date().toISOString())
        $app.save(pipeRec)
      } catch (_) {}

      return e.json(200, {
        id: rec.id,
        content_type: contentType,
        platform: platform,
        titulo: parsed.titulo,
        conteudo_curto: parsed.conteudo_curto,
        conteudo_medio: parsed.conteudo_medio,
        conteudo_longo: parsed.conteudo_longo,
        slides: parsed.slides,
        hashtags: parsed.hashtags,
        cta: parsed.cta,
        palavras_chave: parsed.palavras_chave,
        tempo_leitura: parsed.tempo_leitura,
        justificativa: parsed.justificativa,
        fontes_contexto: parsed.fontes_contexto,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
