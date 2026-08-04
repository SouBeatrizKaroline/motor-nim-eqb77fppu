routerAdd(
  'POST',
  '/backend/v1/crisis/{id}/process',
  (e) => {
    try {
      const alertId = e.request.pathValue('id')
      const alertRec = $app.findRecordById('crisis_alerts', alertId)
      if (!alertRec) return e.notFoundError('Alerta de crise não encontrado')

      const summary = alertRec.getString('summary')
      const severity = alertRec.getString('severity')

      alertRec.set('status', 'processando')
      $app.save(alertRec)

      // Stage 1 & 2 & 3 via AI Gateway
      const prompt =
        "Você é um agente de inteligência política e gestão de crises parlamentares. Analise o seguinte resumo de crise: '" +
        summary +
        "' (Severidade: " +
        severity +
        ').\n' +
        'Responda ESTRITAMENTE em formato JSON com o seguinte esquema sem markdown:\n' +
        '{\n' +
        '  "causa_raiz": "Causa raiz provável e identificada da insatisfação em 1 frase",\n' +
        '  "resumo_contexto": "Resumo explicativo do cenário",\n' +
        '  "nota_oficial": "Texto completo e formal de Nota Oficial do Mandato Parlamentar posicionando-se sobre o fato",\n' +
        '  "roteiro_video": {\n' +
        '    "hook": "Frase de abertura forte (0-3s)",\n' +
        '    "declaracao_central": "Mensagem principal de posicionamento",\n' +
        '    "fechamento": "Chamada final com compromisso do mandato",\n' +
        '    "duracao_segundos": 45\n' +
        '  },\n' +
        '  "payload_whatsapp": {\n' +
        '    "mensagem": "🚨 ALERTA DE CRISE & RESPOSTA RÁPIDA\\n\\nMandato atuando diante do caso. Nota oficial emitida e vídeo publicado.",\n' +
        '    "tipo": "alerta_crise"\n' +
        '  }\n' +
        '}'

      let parsed = null
      try {
        const aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente de IA focado em gestão de crise política que responde apenas em JSON válido.',
            },
            { role: 'user', content: prompt },
          ],
        })

        const rawContent = aiRes.choices[0].message.content
        const jsonStart = rawContent.indexOf('{')
        const jsonEnd = rawContent.lastIndexOf('}')
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsed = JSON.parse(rawContent.substring(jsonStart, jsonEnd + 1))
        }
      } catch (aiErr) {
        $app.logger().error('Erro na IA ao processar crise: ' + aiErr.message)
      }

      if (!parsed) {
        parsed = {
          causa_raiz: 'Insatisfação de munícipes com atendimento nos serviços públicos locais.',
          resumo_contexto: summary,
          nota_oficial:
            'NOTA OFICIAL DO MANDATO\n\nInformamos que nosso gabinete tomou conhecimento imediato das demandas da população e já oficiou os órgãos competentes exigindo providências céleres e fiscalização no local.',
          roteiro_video: {
            hook: 'Acompanhou o problema de hoje? Nosso gabinete já cobrou providências imediatas!',
            declaracao_central:
              'Não aceitaremos falhas na prestação do serviço público à nossa comunidade.',
            fechamento: 'Cobramos resposta da prefeitura ainda hoje. Acompanhe nossas redes.',
            duracao_segundos: 45,
          },
          payload_whatsapp: {
            mensagem:
              '🚨 NOTA OFICIAL E AÇÃO DO MANDATO\n\nDiante da situação identificada, nosso mandato já protocolou requerimento de fiscalização.',
            tipo: 'alerta_crise',
          },
        }
      }

      alertRec.set(
        'causa_raiz',
        parsed.causa_raiz || 'Insatisfação popular identificada em redes sociais.',
      )
      alertRec.set('nota_oficial', parsed.nota_oficial || '')
      alertRec.set('roteiro_video', parsed.roteiro_video || {})
      alertRec.set('payload_whatsapp', parsed.payload_whatsapp || {})
      alertRec.set('status', 'nota_pronta')
      $app.save(alertRec)

      // Create notification
      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notifRec = new Record(notifCol)
        notifRec.set('channel', 'whatsapp')
        notifRec.set('target', '5511999998888')
        notifRec.set('payload', parsed.payload_whatsapp)
        notifRec.set('status', 'pendente')
        notifRec.set('provider', 'webhook')
        notifRec.set('related_type', 'crisis_alert')
        notifRec.set('related_id', alertId)
        $app.save(notifRec)
      } catch (_) {}

      // Register pipeline run
      try {
        const pipeCol = $app.findCollectionByNameOrId('pipeline_runs')
        const pipeRec = new Record(pipeCol)
        pipeRec.set('pipeline', 'crise')
        pipeRec.set('trigger', 'manual')
        pipeRec.set('status', 'sucesso')
        pipeRec.set('stage', 'redação e mídia')
        pipeRec.set('input', { alert_id: alertId })
        pipeRec.set('output', { causa_raiz: parsed.causa_raiz })
        pipeRec.set('started_at', new Date().toISOString())
        pipeRec.set('finished_at', new Date().toISOString())
        $app.save(pipeRec)
      } catch (_) {}

      return e.json(200, {
        success: true,
        alert_id: alertId,
        status: 'nota_pronta',
        causa_raiz: parsed.causa_raiz,
        nota_oficial: parsed.nota_oficial,
        roteiro_video: parsed.roteiro_video,
        payload_whatsapp: parsed.payload_whatsapp,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
