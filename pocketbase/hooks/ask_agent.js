routerAdd(
  'POST',
  '/backend/v1/ask',
  (e) => {
    try {
      const userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('Autenticação necessária')

      const body = e.requestInfo().body || {}
      const message =
        typeof body.message === 'string'
          ? body.message.trim()
          : body.message
            ? String(body.message).trim()
            : ''
      if (!message) return e.badRequestError('Mensagem é obrigatória')

      if (message.toUpperCase() === '/AUDITAR') {
        const conversationId = body.conversation_id || null
        if (!conversationId) {
          return e.json(200, {
            content:
              '## RELATÓRIO DE AUDITORIA\n\nNão há conversa anterior para auditar. Envie uma pergunta primeiro e depois use /AUDITAR para revisar a resposta.',
            conversation_id: null,
            message_id: '',
            citations: [],
            sources: [],
            is_audit: true,
          })
        }

        var lastMessages = []
        try {
          var msgData = $ai.agent('imagis-analista').listMessages({
            conversation_id: conversationId,
            user_id: userId,
          })
          if (msgData && Array.isArray(msgData.messages)) {
            lastMessages = msgData.messages
          } else if (Array.isArray(msgData)) {
            lastMessages = msgData
          }
        } catch (_) {}

        var lastUserMsg = ''
        var lastAssistantMsg = ''
        for (var i = lastMessages.length - 1; i >= 0; i--) {
          var m = lastMessages[i]
          if (m.role === 'assistant' && m.content && !lastAssistantMsg) {
            lastAssistantMsg = m.content
          }
          if (m.role === 'user' && !lastUserMsg) {
            lastUserMsg = m.content
          }
          if (lastAssistantMsg && lastUserMsg) break
        }

        if (!lastAssistantMsg) {
          return e.json(200, {
            content:
              '## RELATÓRIO DE AUDITORIA\n\nNão foi possível encontrar uma resposta anterior para auditar.',
            conversation_id: conversationId,
            message_id: '',
            citations: [],
            sources: [],
            is_audit: true,
          })
        }

        var auditPrompt =
          'Você é um auditor de IA. Revise a seguinte resposta do assistente Imagis e produza um RELATÓRIO DE AUDITORIA estruturado.\n\n' +
          'PERGUNTA ORIGINAL DO USUÁRIO:\n' +
          lastUserMsg +
          '\n\n' +
          'RESPOSTA A SER AUDITADA:\n' +
          lastAssistantMsg +
          '\n\n' +
          'Produza o relatório no seguinte formato:\n\n' +
          '## RELATÓRIO DE AUDITORIA\n\n' +
          '### Informações Verificadas\n- (liste informações que podem ser confirmadas com fontes)\n\n' +
          '### Fontes Utilizadas\n- (liste as fontes citadas ou que deveriam ter sido citadas)\n\n' +
          '### Links\n- (liste os links mencionados, ou indique se não há links verificáveis)\n\n' +
          '### Pontos de Atenção\n- (informações não verificadas, suposições, dados desatualizados, risco de interpretação errônea)\n\n' +
          '### Nível de Confiança Geral\n(Alto/Médio/Baixo — com justificativa)\n\n' +
          'Analise criticamente: quais informações vieram de fontes externas, quais são suposições, quais dados precisam de confirmação, se existem links oficiais, se alguma informação pode estar desatualizada e se há risco de interpretação equivocada.'

        var auditResult = $ai.chat({
          model: 'reasoning',
          messages: [
            {
              role: 'system',
              content:
                'Você é um auditor rigoroso de respostas de IA. Seja honesto e crítico. Responda em português brasileiro.',
            },
            { role: 'user', content: auditPrompt },
          ],
        })

        return e.json(200, {
          content: auditResult.choices[0].message.content,
          conversation_id: conversationId,
          message_id: '',
          citations: [],
          sources: [],
          is_audit: true,
        })
      }

      const result = $ai.agent('imagis-analista').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: message,
      })

      var content = result.content || ''
      var sources = []

      var srcStart = content.indexOf('[[SOURCES_START]]')
      var srcEnd = content.indexOf('[[SOURCES_END]]')
      if (srcStart !== -1 && srcEnd !== -1 && srcEnd > srcStart) {
        var jsonStr = content.substring(srcStart + '[[SOURCES_START]]'.length, srcEnd).trim()
        try {
          var parsedSources = JSON.parse(jsonStr)
          if (Array.isArray(parsedSources) && parsedSources.length > 0) {
            content = (
              content.substring(0, srcStart) + content.substring(srcEnd + '[[SOURCES_END]]'.length)
            ).trim()

            var srcCol = $app.findCollectionByNameOrId('source_references')
            for (var si = 0; si < parsedSources.length; si++) {
              var s = parsedSources[si]
              try {
                var srcRec = new Record(srcCol)
                srcRec.set('title', s.title || '')
                srcRec.set('description', s.description || '')
                srcRec.set('origin', s.origin || '')
                srcRec.set('source', s.source || '')
                if (s.link) srcRec.set('link', s.link)
                srcRec.set('collected_at', s.collected_at || new Date().toISOString().split('T')[0])
                srcRec.set('author_org', s.author_org || '')
                srcRec.set('category', s.category || '')
                srcRec.set('reliability', s.reliability || 'média')
                srcRec.set('source_type', s.source_type || 'outra')
                srcRec.set('observations', s.observations || '')
                srcRec.set('related_type', 'agent_chat')
                srcRec.set('related_id', result.message_id || '')
                $app.save(srcRec)
                sources.push({
                  id: srcRec.id,
                  title: s.title || '',
                  description: s.description || '',
                  origin: s.origin || '',
                  source: s.source || '',
                  link: s.link || '',
                  collected_at: s.collected_at || '',
                  category: s.category || '',
                  reliability: s.reliability || 'média',
                  source_type: s.source_type || 'outra',
                  observations: s.observations || '',
                })
              } catch (saveErr) {
                $app.logger().error('failed to save source reference', 'error', String(saveErr))
              }
            }
          }
        } catch (_) {}
      }

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: content,
        citations: result.citations || [],
        message_id: result.message_id,
        sources: sources,
        is_audit: false,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'IA temporariamente indisponível' })
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'agent request failed' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, {
          error: status >= 500 ? 'IA temporariamente indisponível' : err.message,
        })
      }
      $app.logger().error('ask agent failed', 'error', String(err))
      return e.json(500, { error: err.message || 'Erro no agente Imagis' })
    }
  },
  $apis.requireAuth(),
)
