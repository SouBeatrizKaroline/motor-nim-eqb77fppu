migrate(
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')

    // Seed brand identity settings if not present
    try {
      app.findFirstRecordByData('settings', 'key', 'brand_identity')
    } catch (_) {
      const brandRec = new Record(settingsCol)
      brandRec.set('key', 'brand_identity')
      brandRec.set('value', {
        organization_name: 'Governo do Estado / Mandato Executivo',
        slogan: 'Inovação, Transparência e Desenvolvimento Humano',
        primary_color: '#1E3A8A',
        secondary_color: '#0D9488',
        accent_color: '#F59E0B',
        dark_color: '#0F172A',
        light_color: '#F8FAFC',
        primary_font: 'Inter, sans-serif',
        secondary_font: 'Merriweather, serif',
        tone_of_voice: 'Institucional, empático, transparente e orientador para o cidadão',
        prohibited_terms: [
          'fake news',
          'polêmica vazia',
          'promessa sem prazo',
          'linguagem agressiva',
        ],
        default_hashtags: [
          '#MandatoTransparente',
          '#GestaoPublica',
          '#CompromissoComOTexto',
          '#AvancaEstado',
        ],
        logo_url: 'https://img.usecurling.com/i?q=governo&color=blue',
        key_pilars: [
          'Saúde e Bem-Estar',
          'Educação de Qualidade',
          'Infraestrutura Regional',
          'Segurança Cidadã',
        ],
      })
      app.save(brandRec)
    }

    // Seed sample content items if collection is empty
    const contentCol = app.findCollectionByNameOrId('content_items')
    if (app.countRecords('content_items') === 0) {
      const now = new Date()

      // Item 1: Published Post
      const item1 = new Record(contentCol)
      item1.set('title', 'Aumento no Investimento em Unidades Básicas de Saúde')
      item1.set('type', 'post')
      item1.set('status', 'published')
      item1.set('idea', 'comunicado')
      item1.set('channel', 'instagram')
      item1.set('campaign', 'Saúde Pública Prioritária')
      item1.set(
        'draft',
        'Anunciamos hoje a ampliação de R$ 45 milhões para modernização das UBSs estaduais. Mais médicos, equipamentos de ponta e exames mais rápidos para a população.',
      )
      item1.set(
        'briefing',
        JSON.stringify({
          topic: 'Investimentos em Saúde',
          tom_de_voz: 'Empático e Informativo',
          hashtags: ['#SaudePublica', '#InvestimentoSaude', '#MaisMedicos'],
          cta: 'Confira a lista de unidades beneficiadas no link da bio.',
          palavras_chave: ['UBS', 'Saúde', 'Investimento', 'Atendimento'],
          tempo_leitura: '2 min',
          justificativa: 'Tema com 72% de mentions positivas no vTracker e demanda alta em saúde.',
          adaptations: {
            instagram:
              'Anunciamos hoje a ampliação de R$ 45 milhões para modernização das UBSs estaduais! 🏥✨ Mais médicos e novos equipamentos para atender você melhor.\n\nConfira as unidades beneficiadas no link da bio! #SaudePublica #Investimento',
            linkedin:
              'Investir na atenção primária é garantir dignidade e eficiência aos cidadãos. Com aporte de R$ 45M, o Governo fortalece o sistema de saúde regional com foco em prevenção e humanização.',
            twitter:
              '🚨 Saúde em primeiro lugar: R$ 45M destinados à modernização de UBSs em todo o estado. Mais agilidade em consultas e exames para quem mais precisa. #SaudePublica',
            whatsapp:
              '📢 *Boletim do Mandato - Saúde*\n\nInformamos que foi liberado investimento recorde de R$ 45 milhões para melhorias nas postos de saúde da região. Saiba mais detalhes aqui: https://governo.gov.br/saude',
          },
        }),
      )
      item1.set('published_at', new Date(now.getTime() - 2 * 86400000).toISOString())
      item1.set('performance', {
        reach: 128500,
        impressions: 164000,
        engagement: 19200,
        shares: 1140,
        likes: 15400,
        comments: 2660,
        ctr: 4.8,
      })
      app.save(item1)

      // Item 2: Scheduled Carousel
      const item2 = new Record(contentCol)
      item2.set('title', 'Guia do Cidadão: Como solicitar obras na sua comunidade')
      item2.set('type', 'carousel')
      item2.set('status', 'scheduling')
      item2.set('idea', 'carrossel')
      item2.set('channel', 'instagram')
      item2.set('campaign', 'Participação Cidadã')
      item2.set(
        'draft',
        'Passo a passo prático para registrar solicitações de pavimentação, iluminação e saneamento na Ouvidoria Geral.',
      )
      item2.set(
        'briefing',
        JSON.stringify({
          topic: 'Ouvidoria e Obras',
          tom_de_voz: 'Didático e Orientador',
          hashtags: ['#GuiaDoCidadao', '#ParticipacaoSocial', '#ObrasPublicas'],
          cta: 'Salve este post para consultar quando precisar!',
          slides: [
            {
              slide: 1,
              titulo: 'Como pedir melhorias para o seu bairro',
              texto: 'Um guia simples em 4 passos para acionar a prefeitura e o governo estadual.',
              imagem_sugestao: 'Ilustração de mapa urbano com ícones de participação cidadã',
            },
            {
              slide: 2,
              titulo: 'Passo 1: Identifique a Demanda',
              texto: 'Tire fotos com geolocalização e anote o endereço exato do local.',
              imagem_sugestao: 'Celular fotografando rua pública com boa iluminação',
            },
            {
              slide: 3,
              titulo: 'Passo 2: Acesse o Portal do Cidadão',
              texto: 'Preencha o formulário simplificado sem necessidade de intermediários.',
              imagem_sugestao: 'Mockup de tela de computador no formulário governamental',
            },
            {
              slide: 4,
              titulo: 'Passo 3: Acompanhe o Protocolo',
              texto: 'Receba notificações por WhatsApp a cada atualização do status da obra.',
              imagem_sugestao: 'Notificação de celular com confirmação de protocolo registrado',
            },
          ],
        }),
      )
      item2.set('scheduled_at', new Date(now.getTime() + 1 * 86400000).toISOString())
      app.save(item2)

      // Item 3: Video Script (In Review)
      const item3 = new Record(contentCol)
      item3.set('title', 'Pronunciamento: Novo Programa de Formação Técnica para Jovens')
      item3.set('type', 'reels')
      item3.set('status', 'review')
      item3.set('idea', 'roteiro_video')
      item3.set('channel', 'instagram')
      item3.set('campaign', 'Futuro Profissional')
      item3.set(
        'draft',
        'Roteiro dinâmico de 45 segundos sobre 10 mil vagas gratuitas em cursos de tecnologia e inovação.',
      )
      item3.set(
        'briefing',
        JSON.stringify({
          topic: 'Cursos Técnicos Gratuitos',
          tom_de_voz: 'Entusiasta e Inspirador',
          hashtags: ['#JovensDoFuturo', '#EducacaoTecnica', '#Oportunidade'],
          cta: 'Inscrições abertas até sexta-feira!',
          video_storyboard: [
            {
              cena: 1,
              tempo: '0-5s',
              enquadramento: 'Plano Médio / Câmera na altura dos olhos',
              audio:
                'Você tem entre 16 e 29 anos e quer entrar no mercado de trabalho ganhando bem?',
              legenda: '10.000 VAGAS GRATUITAS EM TECNOLOGIA 🚀',
            },
            {
              cena: 2,
              tempo: '5-18s',
              enquadramento: 'Corte rápido para imagens de alunos em laboratório de informática',
              audio:
                'Lançamos hoje o programa Capacita+ Tech. Cursos 100% gratuitos com bolsa permanência.',
              legenda: 'Bolsa auxílio + Certificado reconhecido',
            },
            {
              cena: 3,
              tempo: '18-35s',
              enquadramento: 'Gabinete / Gestor falando diretamente para a câmera',
              audio: 'Sem burocracia. Aulas presenciais e online com instrutores do mercado de TI.',
              legenda: 'Inscrições fáceis no site oficial',
            },
            {
              cena: 4,
              tempo: '35-45s',
              enquadramento: 'Plano Fechado com QR Code e CTA em destaque na tela',
              audio: 'Não perca essa oportunidade. Acesse o link do formulário agora!',
              legenda: 'INSCREVA-SE JÁ | Link na Bio',
            },
          ],
        }),
      )
      app.save(item3)

      // Item 4: Draft News Release
      const item4 = new Record(contentCol)
      item4.set('title', 'Nota Oficial: Esclarecimento sobre Obras no Anel Viário Norte')
      item4.set('type', 'site')
      item4.set('status', 'draft')
      item4.set('idea', 'nota_oficial')
      item4.set('channel', 'site')
      item4.set('campaign', 'Transparência em Infraestrutura')
      item4.set(
        'draft',
        'O Governo do Estado esclarece que as intervenções no Anel Viário Norte seguem dentro do cronograma e visam garantir segurança viária definitiva aos condutores.',
      )
      item4.set(
        'briefing',
        JSON.stringify({
          topic: 'Trânsito e Obras',
          tom_de_voz: 'Sério, Transparente e Técnico',
          hashtags: ['#NotaOficial', '#Infraestrutura', '#MobilidadeUrbana'],
          cta: 'Consulte as rotas alternativas no mapa interativo.',
          palavras_chave: ['Anel Viário', 'Intervenção', 'Trânsito', 'Cronograma'],
          tempo_leitura: '3 min',
          justificativa:
            'Resposta preventiva ao aumento de menções críticas sobre retenção no trânsito na região Norte.',
        }),
      )
      app.save(item4)
    }
  },
  (app) => {
    // Optional revert logic
  },
)
