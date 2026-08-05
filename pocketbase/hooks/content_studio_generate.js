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
      const includeBrandIdentity = body.use_brand !== false

      if (!topic.trim()) return e.badRequestError('O tema é obrigatório para geração de conteúdo.')

      // Retrieve Brand Settings if available
      var brandInfo = ''
      if (includeBrandIdentity) {
        try {
          var brandRec = $app.findFirstRecordByData('settings', 'key', 'brand_identity')
          if (brandRec) {
            var bVal = brandRec.get('value')
            if (typeof bVal === 'string') {
              try {
                bVal = JSON.parse(bVal)
              } catch (_) {}
            }
            if (bVal) {
              brandInfo =
                'Diretrizes de Marca da Organização:\n' +
                '- Nome: ' +
                (bVal.organization_name || '') +
                '\n' +
                '- Tom de Voz Oficial: ' +
                (bVal.tone_of_voice || tomVoz) +
                '\n' +
                '- Palavras e Princípios Chave: ' +
                (Array.isArray(bVal.key_pilars) ? bVal.key_pilars.join(', ') : '') +
                '\n' +
                '- Termos Proibidos: ' +
                (Array.isArray(bVal.prohibited_terms) ? bVal.prohibited_terms.join(', ') : '') +
                '\n' +
                '- Hashtags Padrão: ' +
                (Array.isArray(bVal.default_hashtags) ? bVal.default_hashtags.join(', ') : '') +
                '\n\n'
            }
          }
        } catch (_) {}
      }

      // Retrieve Social Intelligence Context
      var intelligenceContext = ''
      try {
        var topics = $app.findRecordsByFilter('social_topics', 'active=true', '-created', 5, 0)
        if (topics && topics.length > 0) {
          var termList = topics
            .map(function (t) {
              return t.getString('term')
            })
            .join(', ')
          intelligenceContext += 'Pautas e Termos em Alta na Escuta Social: ' + termList + '\n'
        }
      } catch (_) {}

      var ctLabels = {
        comunicado: 'Comunicado Oficial',
        nota_oficial: 'Nota Oficial de Esclarecimento',
        pronunciamento: 'Pronunciamento Executivo',
        discurso: 'Discurso para Evento / Solenidade',
        artigo: 'Artigo de Opinião / Op-Ed',
        release: 'Press Release para Imprensa',
        legenda: 'Legenda para Redes Sociais',
        threads: 'Sequência de Threads',
        newsletter: 'Informativo / Newsletter',
        roteiro_video: 'Roteiro de Vídeo (Reels / TikTok / Shorts)',
        faq: 'Perguntas Frequentes (FAQ)',
        email: 'E-mail Institucional',
        resumo_executivo: 'Resumo Executivo para Gabinete',
        texto_whatsapp: 'Mensagem Transmissão WhatsApp',
        carrossel: 'Carrossel Educativo / Guia Visual',
        infografico: 'Infográfico Informativo',
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
        site: 'Portal / Site Institucional',
        newsletter: 'Newsletter Oficial',
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
        carrossel: 'carousel',
        roteiro_video: 'reels',
      }

      var ctLabel = ctLabels[contentType] || contentType
      var pLabel = pLabels[platform] || platform

      var isCarousel = contentType === 'carrossel' || contentType === 'infografico'
      var isVideo =
        contentType === 'roteiro_video' || platform === 'tiktok' || platform === 'youtube'

      var schemaPrompt = ''
      if (isCarousel) {
        schemaPrompt =
          '{\n' +
          '  "titulo": "Título cativante para a capa do carrossel",\n' +
          '  "conteudo_curto": "Legenda curta que acompanhará o carrossel nas redes",\n' +
          '  "slides": [\n' +
          '    {"slide": 1, "titulo": "Capa / Hook", "texto": "Texto principal do slide 1", "imagem_sugestao": "Prompt e diretriz visual para o designer/IA"},\n' +
          '    {"slide": 2, "titulo": "Ponto de Atenção", "texto": "Explicação clara em tópicos", "imagem_sugestao": "Prompt de imagem descritivo"},\n' +
          '    {"slide": 3, "titulo": "Ação / Solução", "texto": "O que o governo/mandato está fazendo", "imagem_sugestao": "Prompt visual"},\n' +
          '    {"slide": 4, "titulo": "Call to Action", "texto": "Instrução final para o leitor", "imagem_sugestao": "Card de encerramento com logo"}\n' +
          '  ],\n' +
          '  "cta": "Siga nosso perfil e compartilhe este guia",\n' +
          '  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],\n' +
          '  "palavras_chave": ["termo1", "termo2"],\n' +
          '  "justificativa": "Por que este formato atrai o público-alvo",\n' +
          '  "adaptations": {\n' +
          '    "instagram": "Texto adaptado para o Instagram",\n' +
          '    "linkedin": "Texto em tom profissional para LinkedIn",\n' +
          '    "twitter": "Resumo sintético para o X",\n' +
          '    "whatsapp": "Texto formatado com *negritos* e emojis para WhatsApp"\n' +
          '  }\n' +
          '}'
      } else if (isVideo) {
        schemaPrompt =
          '{\n' +
          '  "titulo": "Título de impacto do vídeo",\n' +
          '  "conteudo_curto": "Texto de legenda e descrição do vídeo",\n' +
          '  "video_storyboard": [\n' +
          '    {"cena": 1, "tempo": "0-5s", "enquadramento": "Plano Médio / Câmera dinâmica", "audio": "Locução / Fala do orador", "legenda": "TEXTO EM DESTAQUE NA TELA"},\n' +
          '    {"cena": 2, "tempo": "5-15s", "enquadramento": "Corte para B-Roll de obras/atendimento", "audio": "Locução contínua explicando o tema", "legenda": "DADOS E ESTATÍSTICAS"},\n' +
          '    {"cena": 3, "tempo": "15-30s", "enquadramento": "Gabinete / Câmera fixa com Iluminação Key Light", "audio": "Mensagem de compromisso e chamada", "legenda": "LINK NA BIO PARA SABER MAIS"}\n' +
          '  ],\n' +
          '  "thumbnail_prompt": "Descrição detalhada da thumbnail para o vídeo",\n' +
          '  "cta": "Comente e compartilhe seu ponto de vista",\n' +
          '  "hashtags": ["#Reels", "#GestaoPublica", "#Inovacao"],\n' +
          '  "palavras_chave": ["termo1", "termo2"],\n' +
          '  "justificativa": "Retenção estimada nos primeiros 3 segundos",\n' +
          '  "adaptations": {\n' +
          '    "instagram": "Legenda focada em engajamento no Instagram",\n' +
          '    "tiktok": "Legenda direta e viral para TikTok",\n' +
          '    "youtube": "Descrição detalhada para Shorts/YouTube"\n' +
          '  }\n' +
          '}'
      } else {
        schemaPrompt =
          '{\n' +
          '  "titulo": "Título oficial do conteúdo",\n' +
          '  "conteudo_curto": "Versão sucinta para postagens rápidas ou banners (até 300 caracteres)",\n' +
          '  "conteudo_medio": "Versão padrão para publicações de redes sociais (500 a 1200 caracteres)",\n' +
          '  "conteudo_longo": "Versão completa e aprofundada para site, discursos ou press release",\n' +
          '  "cta": "Chamada para ação clara e estratégica",\n' +
          '  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],\n' +
          '  "palavras_chave": ["termo1", "termo2", "termo3"],\n' +
          '  "tempo_leitura": "2 min",\n' +
          '  "justificativa": "Análise estratégica de por que esta abordagem é eficaz perante a opinião pública",\n' +
          '  "fontes_contexto": ["Dados públicos de escuta social vTracker", "Diretrizes de governo"],\n' +
          '  "adaptations": {\n' +
          '    "instagram": "Versão pronta e formatada para Instagram",\n' +
          '    "linkedin": "Versão em tom executivo corporativo para LinkedIn",\n' +
          '    "twitter": "Versão concisa respeitando o limite de caracteres do X",\n' +
          '    "whatsapp": "Versão para listas de transmissão com formatação WhatsApp (*negrito*, _itálico_)",\n' +
          '    "newsletter": "Versão em formato e-mail institucional"\n' +
          '  }\n' +
          '}'
      }

      var prompt =
        'Você é o motor de IA do Núcleo Criativo Imagis, especialista em comunicação política estratégica e marketing governamental no Brasil.\n\n' +
        brandInfo +
        intelligenceContext +
        'SOLICITAÇÃO DE CONTEÚDO:\n' +
        '- Tipo: ' +
        ctLabel +
        '\n' +
        '- Canal Principal: ' +
        pLabel +
        '\n' +
        '- Tema Central: ' +
        topic +
        '\n' +
        '- Tom de Voz Desejado: ' +
        tomVoz +
        '\n' +
        '- Público-Alvo: ' +
        (publicoAlvo || 'População em geral e formadores de opinião') +
        '\n' +
        '- Contexto Adicional: ' +
        (contexto || 'Comunicação oficial e transparência pública') +
        '\n\n' +
        'DIRETRIZES:\n' +
        '1. Gere um conteúdo altamente persuasivo, profissional e visualmente pensado.\n' +
        '2. Respeite as regras de elegância institucional, sem linguagem vulgar ou ataques pejorativos.\n' +
        '3. Forneça adaptações para múltiplas plataformas para distribuição imediata.\n\n' +
        'Responda ESTRITAMENTE um objeto JSON válido (sem tags markdown nem explicações fora do JSON) conforme o formato abaixo.\n' +
        'Se utilizar informações de fontes externas, inclua um campo extra "fontes_utilizadas": [{"titulo":"","descricao":"","origem":"","fonte":"","link":"","data":"","categoria":"","confiabilidade":"","observacoes":""}]\n' +
        schemaPrompt

      var parsed = null
      try {
        var aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente de inteligência e criação de conteúdo institucional que responde exclusivamente em formato JSON sintaticamente correto.',
            },
            { role: 'user', content: prompt },
          ],
        })
        var raw = aiRes.choices[0].message.content
        var s = raw.indexOf('{')
        var en = raw.lastIndexOf('}')
        if (s !== -1 && en !== -1) {
          parsed = JSON.parse(raw.substring(s, en + 1))
        }
      } catch (aiErr) {
        $app.logger().error('content studio AI execution failed', 'error', String(aiErr))
      }

      if (!parsed) {
        parsed = {
          titulo: topic,
          conteudo_curto: 'Conteúdo institucional sobre ' + topic,
          conteudo_medio:
            'O Governo reforça seu compromisso com ' +
            topic +
            '. Ações contínuas visam trazer soluções diretas para toda a comunidade.',
          conteudo_longo:
            'O compromisso com ' +
            topic +
            ' é pilar fundamental da nossa atuação. Em diálogo aberto com a sociedade, seguimos executando projetos transformadores.',
          cta: 'Saiba mais nos canais oficiais',
          hashtags: ['#Mandato', '#Transparencia', '#GestaoPublica'],
          palavras_chave: [topic, 'Gestão'],
          tempo_leitura: '2 min',
          justificativa: 'Conteúdo gerado para engajamento e clareza informativa.',
          fontes_contexto: ['Portal Transparência', 'Escuta Social'],
          adaptations: {
            instagram:
              'Confira as atualizações sobre ' +
              topic +
              '!\n\nSaiba mais em nossos stories e link da bio. #GestaoPublica',
            linkedin:
              'Avanços importantes em ' +
              topic +
              '. O fortalecimento de políticas públicas eficientes gera resultados concretos.',
            twitter:
              '🚨 Atualização: Ações firmes sobre ' +
              topic +
              '. Acompanhe a transparência total dos dados.',
            whatsapp:
              '📢 *Informativo Oficial*\n\nSaiba tudo sobre as novas ações de ' +
              topic +
              ' em nosso portal.',
          },
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
          content_type: contentType,
          tom_de_voz: tomVoz,
          contexto: contexto,
          publico_alvo: publicoAlvo,
          hashtags: parsed.hashtags || [],
          cta: parsed.cta || '',
          palavras_chave: parsed.palavras_chave || [],
          tempo_leitura: parsed.tempo_leitura || '2 min',
          justificativa: parsed.justificativa || '',
          fontes_contexto: parsed.fontes_contexto || [],
          slides: parsed.slides || null,
          video_storyboard: parsed.video_storyboard || null,
          thumbnail_prompt: parsed.thumbnail_prompt || null,
          adaptations: parsed.adaptations || {},
          conteudo_curto: parsed.conteudo_curto || '',
          conteudo_medio: parsed.conteudo_medio || '',
          conteudo_longo: parsed.conteudo_longo || '',
        }),
      )
      rec.set('draft', parsed.conteudo_medio || parsed.conteudo_curto || parsed.titulo || '')
      rec.set('campaign', topic)
      rec.set('channel', platform)
      $app.save(rec)

      // Record pipeline execution run
      try {
        var pipeCol = $app.findCollectionByNameOrId('pipeline_runs')
        var pipeRec = new Record(pipeCol)
        pipeRec.set('pipeline', 'roteiro')
        pipeRec.set('trigger', 'manual')
        pipeRec.set('status', 'sucesso')
        pipeRec.set('stage', 'Núcleo Criativo Imagis: ' + ctLabel)
        pipeRec.set('input', {
          content_type: contentType,
          platform: platform,
          topic: topic,
          tom_de_voz: tomVoz,
        })
        pipeRec.set('output', { content_id: rec.id, title: parsed.titulo })
        pipeRec.set('started_at', new Date().toISOString())
        pipeRec.set('finished_at', new Date().toISOString())
        $app.save(pipeRec)
      } catch (_) {}

      if (parsed.fontes_utilizadas && Array.isArray(parsed.fontes_utilizadas)) {
        try {
          var srcCol = $app.findCollectionByNameOrId('source_references')
          for (var si = 0; si < parsed.fontes_utilizadas.length; si++) {
            var fs = parsed.fontes_utilizadas[si]
            if (!fs.titulo && !fs.fonte) continue
            var srcRec = new Record(srcCol)
            srcRec.set('title', fs.titulo || '')
            srcRec.set('description', fs.descricao || '')
            srcRec.set('origin', fs.origem || '')
            srcRec.set('source', fs.fonte || '')
            if (fs.link) srcRec.set('link', fs.link)
            srcRec.set('collected_at', fs.data || new Date().toISOString().split('T')[0])
            srcRec.set('category', fs.categoria || 'Conteúdo')
            srcRec.set('reliability', fs.confiabilidade || 'média')
            srcRec.set('source_type', 'especializada')
            srcRec.set('observations', fs.observacoes || '')
            srcRec.set('related_type', 'content')
            srcRec.set('related_id', rec.id)
            $app.save(srcRec)
          }
        } catch (_) {}
      }

      return e.json(200, {
        id: rec.id,
        content_type: contentType,
        platform: platform,
        titulo: parsed.titulo,
        conteudo_curto: parsed.conteudo_curto,
        conteudo_medio: parsed.conteudo_medio,
        conteudo_longo: parsed.conteudo_longo,
        slides: parsed.slides,
        video_storyboard: parsed.video_storyboard,
        thumbnail_prompt: parsed.thumbnail_prompt,
        adaptations: parsed.adaptations,
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
