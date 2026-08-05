routerAdd(
  'POST',
  '/backend/v1/copilot/ask',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message || !body.message.trim()) return e.badRequestError('message is required')

      if (body.message.trim().toUpperCase() === '/AUDITAR') {
        const conversationId = body.conversation_id || null
        if (!conversationId) {
          return e.json(200, {
            content: '## RELATÓRIO DE AUDITORIA\n\nNão há conversa anterior para auditar.',
            conversation_id: null,
            message_id: '',
            citations: [],
            sources: [],
            is_audit: true,
          })
        }

        var lastMessages = []
        try {
          var msgData = $ai
            .agent('imagis-copiloto')
            .listMessages({ conversation_id: conversationId, user_id: userId })
          if (msgData && Array.isArray(msgData.messages)) lastMessages = msgData.messages
          else if (Array.isArray(msgData)) lastMessages = msgData
        } catch (_) {}

        var lastUserMsg = ''
        var lastAssistantMsg = ''
        for (var i = lastMessages.length - 1; i >= 0; i--) {
          var m = lastMessages[i]
          if (m.role === 'assistant' && m.content && !lastAssistantMsg) lastAssistantMsg = m.content
          if (m.role === 'user' && !lastUserMsg) lastUserMsg = m.content
          if (lastAssistantMsg && lastUserMsg) break
        }

        if (!lastAssistantMsg) {
          return e.json(200, {
            content:
              '## RELATÓRIO DE AUDITORIA\n\nNão foi possível encontrar uma resposta anterior.',
            conversation_id: conversationId,
            message_id: '',
            citations: [],
            sources: [],
            is_audit: true,
          })
        }

        var auditPrompt =
          'Revise a seguinte resposta e produza um RELATÓRIO DE AUDITORIA:\n\n' +
          'PERGUNTA: ' +
          lastUserMsg +
          '\n\nRESPOSTA: ' +
          lastAssistantMsg +
          '\n\n' +
          'Formato: ## RELATÓRIO DE AUDITORIA\n### Informações Verificadas\n### Fontes Utilizadas\n### Links\n### Pontos de Atenção\n### Nível de Confiança Geral'

        var auditResult = $ai.chat({
          model: 'reasoning',
          messages: [
            {
              role: 'system',
              content: 'Você é um auditor rigoroso de IA. Responda em português brasileiro.',
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

      const result = $ai.agent('imagis-copiloto').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: body.message,
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
                srcRec.set('category', s.category || '')
                srcRec.set('reliability', s.reliability || 'média')
                srcRec.set('source_type', s.source_type || 'outra')
                srcRec.set('observations', s.observations || '')
                srcRec.set('related_type', 'copilot_chat')
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
              } catch (_) {}
            }
          }
        } catch (_) {}
      }

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: content,
        citations: result.citations,
        message_id: result.message_id,
        sources: sources,
        is_audit: false,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporariamente indisponível' })
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'agent request failed' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, {
          error: status >= 500 ? 'AI temporariamente indisponível' : err.message,
        })
      }
      $app.logger().error('copilot ask failed', 'error', String(err))
      return e.json(500, { error: 'Failed to process request' })
    }
  },
  $apis.requireAuth(),
)
