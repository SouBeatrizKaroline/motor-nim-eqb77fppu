routerAdd(
  'POST',
  '/backend/v1/speeches/generate',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const tema = body.tema
      if (!tema) return e.badRequestError('O tema da sessão é obrigatório.')

      const tomDeVoz = body.tom_de_voz || 'firme e propositivo'
      const duracaoMinutos = Number(body.duracao_minutos) || 5
      const pautas = body.pautas || []
      const contexto = body.contexto || ''

      const prompt =
        'Você é um redator sênior de discursos para parlamentares brasileiros (Deputados/Vereadores).\n' +
        'Gere um discurso para sessão de plenário com as seguintes diretrizes:\n' +
        '- Tema principal: ' +
        tema +
        '\n' +
        '- Tom de voz: ' +
        tomDeVoz +
        '\n' +
        '- Duração estimada: ' +
        duracaoMinutos +
        ' minutos (' +
        duracaoMinutos * 130 +
        ' palavras aprox.)\n' +
        '- Pautas secundárias/locais: ' +
        JSON.stringify(pautas) +
        '\n' +
        '- Contexto eleitoral/local: ' +
        contexto +
        '\n\n' +
        'Responda estritamente em JSON no seguinte formato (sem explicações nem markdown):\n' +
        '{\n' +
        '  "titulo": "Título marcante do discurso",\n' +
        '  "estrutura": [\n' +
        '    { "secao": "Saudação e Introdução", "conteudo": "..." },\n' +
        '    { "secao": "Contextualização e Pautas", "conteudo": "..." },\n' +
        '    { "secao": "Posicionamento e Defesa", "conteudo": "..." },\n' +
        '    { "secao": "Propostas e Requerimentos", "conteudo": "..." },\n' +
        '    { "secao": "Encerramento e Apelo", "conteudo": "..." }\n' +
        '  ],\n' +
        '  "discurso_completo": "Texto completo unificado do discurso para leitura contínua...",\n' +
        '  "pautas_abordadas": ' +
        JSON.stringify(pautas) +
        ',\n' +
        '  "fontes_utilizadas": [{"titulo":"","descricao":"","origem":"","fonte":"","link":"","data":"","categoria":"","confiabilidade":"","observacoes":""}]\n' +
        '}'

      let parsed = null
      try {
        const aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente parlamentar que gera discursos em JSON.',
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
        $app.logger().error('Erro na geração de discurso: ' + aiErr.message)
      }

      if (!parsed) {
        parsed = {
          titulo: 'Discurso sobre ' + tema,
          estrutura: [
            {
              secao: 'Saudação',
              conteudo: 'Senhor Presidente, nobres pares, cidadãos que nos acompanham.',
            },
            {
              secao: 'Contextualização',
              conteudo:
                'Subo a esta tribuna no dia de hoje para tratar de um tema de extrema relevância: ' +
                tema +
                '.',
            },
            {
              secao: 'Propostas',
              conteudo:
                'Nosso mandato reafirma o compromisso inegociável com a transparência e soluções efetivas.',
            },
            { secao: 'Encerramento', conteudo: 'Muito obrigado, Senhor Presidente.' },
          ],
          discurso_completo:
            'Senhor Presidente, nobres pares, cidadãos que nos acompanham. Subo a esta tribuna para defender o tema: ' +
            tema +
            '. Nosso mandato reafirma o compromisso com a população. Muito obrigado.',
          pautas_abordadas: pautas,
        }
      }

      const speechesCol = $app.findCollectionByNameOrId('speeches')
      const rec = new Record(speechesCol)
      rec.set('title', parsed.titulo)
      rec.set('tema', tema)
      rec.set('tom_de_voz', tomDeVoz)
      rec.set('duracao_minutos', duracaoMinutos)
      rec.set('pautas', pautas)
      rec.set('content', parsed.discurso_completo)
      rec.set('structured_meta', { estrutura: parsed.estrutura })
      $app.save(rec)

      // Pipeline run
      try {
        const pipeCol = $app.findCollectionByNameOrId('pipeline_runs')
        const pipeRec = new Record(pipeCol)
        pipeRec.set('pipeline', 'discurso')
        pipeRec.set('trigger', 'manual')
        pipeRec.set('status', 'sucesso')
        pipeRec.set('stage', 'geração de discurso')
        pipeRec.set('input', { tema: tema, tom_de_voz: tomDeVoz })
        pipeRec.set('output', { speech_id: rec.id, title: parsed.titulo })
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
            srcRec.set('category', fs.categoria || 'Discurso')
            srcRec.set('reliability', fs.confiabilidade || 'média')
            srcRec.set('source_type', 'especializada')
            srcRec.set('observations', fs.observacoes || '')
            srcRec.set('related_type', 'speech')
            srcRec.set('related_id', rec.id)
            $app.save(srcRec)
          }
        } catch (_) {}
      }

      return e.json(200, {
        id: rec.id,
        titulo: parsed.titulo,
        tema: tema,
        tom_de_voz: tomDeVoz,
        duracao_minutos: duracaoMinutos,
        pautas: pautas,
        estrutura: parsed.estrutura,
        discurso_completo: parsed.discurso_completo,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
