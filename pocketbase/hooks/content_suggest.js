routerAdd(
  'POST',
  '/backend/v1/content/suggest',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const title = body.title || ''
      const type = body.type || 'post'
      const tema = body.tema || ''
      const briefing = body.briefing || ''

      const prompt =
        'Sugira para o conteúdo a seguir (formato JSON válido, sem markdown):\n' +
        'Título: ' +
        title +
        '\nTipo: ' +
        type +
        '\nTema: ' +
        tema +
        '\nBriefing: ' +
        briefing +
        '\n\n' +
        'Esquema:\n{"best_time":"horário","format":"formato","cta":"chamada","hashtag":"#tags","thumbnail":"descrição","title":"título otimizado","copy":"legenda","duration":"segundos","frequency":"frequência sugerida"}'

      let suggestions = null
      try {
        const aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em marketing digital e conteúdo para redes sociais. Responda apenas em JSON válido.',
            },
            { role: 'user', content: prompt },
          ],
        })
        const raw = aiRes.choices[0].message.content
        const start = raw.indexOf('{')
        const end = raw.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
          suggestions = JSON.parse(raw.substring(start, end + 1))
        }
      } catch (aiErr) {
        $app.logger().error('Content suggest AI error: ' + aiErr.message)
      }

      if (!suggestions) {
        suggestions = {
          best_time: '18h-20h',
          format: type,
          cta: 'Comente sua opinião!',
          hashtag: '#MandatoPopular #SaúdePública',
          thumbnail: 'Imagem impactante com texto em destaque',
          title: title,
          copy: 'Conteúdo sobre ' + tema,
          duration: '30-60s',
          frequency: '3x por semana',
        }
      }

      return e.json(200, { success: true, suggestions })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
