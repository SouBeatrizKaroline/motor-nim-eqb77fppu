routerAdd(
  'POST',
  '/backend/v1/scripts/generate',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const plataforma = body.plataforma || 'reels'
      const tipoConteudo = body.tipo_conteudo || 'prestacao_de_contas'
      const tema = body.tema || 'Fiscalização dos serviços de saúde'
      const tomDeVoz = body.tom_de_voz || 'dinâmico e direto'

      const prompt =
        'Você é um especialista em roteiros de alta retenção para redes sociais (' +
        plataforma +
        ').\n' +
        'Gere um roteiro estruturado com as diretrizes:\n' +
        '- Tipo de conteúdo: ' +
        tipoConteudo +
        '\n' +
        '- Tema: ' +
        tema +
        '\n' +
        '- Tom de voz: ' +
        tomDeVoz +
        '\n\n' +
        'Responda ESTRITAMENTE em formato JSON sem explicações nem markdown com o seguinte esquema exato:\n' +
        '{\n' +
        '  "plataforma": "' +
        plataforma +
        '",\n' +
        '  "tipo_conteudo": "' +
        tipoConteudo +
        '",\n' +
        '  "hook": "Frase de impacto inicial dos primeiros 0-3 segundos para prender a atenção do usuário",\n' +
        '  "roteiro_detalhado": "Cena 1 (0-3s): [Ação visual] + [Fala].\\nCena 2 (3-15s): [Ação visual] + [Fala principal].\\nCena 3 (15-30s): [CTA final].",\n' +
        '  "texto_legenda": "Texto completo para a legenda do post incluindo chamada para ação nos comentários.",\n' +
        '  "hashtags": ["#mandato", "#' +
        plataforma +
        '", "#transparencia", "#cidade"],\n' +
        '  "tom_de_voz": "' +
        tomDeVoz +
        '",\n' +
        '  "fontes_utilizadas": [{"titulo":"","descricao":"","origem":"","fonte":"","link":"","data":"","categoria":"","confiabilidade":"","observacoes":""}]\n' +
        '}'

      let parsed = null
      try {
        const aiRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em roteiros de retenção que responde estritamente em JSON.',
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
        $app.logger().error('Erro na geração de roteiro: ' + aiErr.message)
      }

      if (!parsed) {
        parsed = {
          plataforma: plataforma,
          tipo_conteudo: tipoConteudo,
          hook: 'Se você mora no nosso município, precisa saber disso agora!',
          roteiro_detalhado:
            "Cena 1 (0-3s): [Vídeo gravado em frente ao local] + Fala: 'Se você mora no nosso município, precisa saber disso agora!'.\nCena 2 (3-15s): [Cortes rápidos mostramos os documentos] + Fala: 'Nosso mandato esteve hoje fiscalizando de perto e cobrando soluções.'.\nCena 3 (15-30s): [Apontando para a tela] + Fala: 'Comente aqui embaixo qual o próximo local que devemos fiscalizar.'",
          texto_legenda:
            'Fiscalização em ação! Acompanhe o trabalho do nosso mandato e deixe seu comentário abaixo. Seu engajamento fortalece nossa cobrança por melhorias.',
          hashtags: ['#mandato', '#fiscalização', '#transparência'],
          tom_de_voz: tomDeVoz,
        }
      }

      const scriptsCol = $app.findCollectionByNameOrId('retention_scripts')
      const rec = new Record(scriptsCol)
      rec.set('platform', plataforma)
      rec.set('tipo_conteudo', tipoConteudo)
      rec.set('tema', tema)
      rec.set('hook', parsed.hook)
      rec.set('roteiro_detalhado', parsed.roteiro_detalhado)
      rec.set('texto_legenda', parsed.texto_legenda)
      rec.set('hashtags', parsed.hashtags)
      rec.set('tom_de_voz', tomDeVoz)
      $app.save(rec)

      // Pipeline run
      try {
        const pipeCol = $app.findCollectionByNameOrId('pipeline_runs')
        const pipeRec = new Record(pipeCol)
        pipeRec.set('pipeline', 'roteiro')
        pipeRec.set('trigger', 'manual')
        pipeRec.set('status', 'sucesso')
        pipeRec.set('stage', 'roteiro de retenção')
        pipeRec.set('input', { plataforma: plataforma, tema: tema })
        pipeRec.set('output', { script_id: rec.id, hook: parsed.hook })
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
            srcRec.set('category', fs.categoria || 'Roteiro')
            srcRec.set('reliability', fs.confiabilidade || 'média')
            srcRec.set('source_type', 'especializada')
            srcRec.set('observations', fs.observacoes || '')
            srcRec.set('related_type', 'script')
            srcRec.set('related_id', rec.id)
            $app.save(srcRec)
          }
        } catch (_) {}
      }

      return e.json(200, {
        id: rec.id,
        plataforma: plataforma,
        tipo_conteudo: tipoConteudo,
        tema: tema,
        hook: parsed.hook,
        roteiro_detalhado: parsed.roteiro_detalhado,
        texto_legenda: parsed.texto_legenda,
        hashtags: parsed.hashtags,
        tom_de_voz: tomDeVoz,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
