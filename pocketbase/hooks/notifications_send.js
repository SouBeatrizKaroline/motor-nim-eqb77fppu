routerAdd(
  'POST',
  '/backend/v1/notifications/{id}/send',
  (e) => {
    try {
      const notifId = e.request.pathValue('id')
      const notifRec = $app.findRecordById('notifications', notifId)
      if (!notifRec) return e.notFoundError('Notificação não encontrada')

      let webhookUrl = ''
      try {
        const settingsRec = $app.findFirstRecordByData('settings', 'key', 'motor_nim')
        const val = settingsRec.get('value') || {}
        webhookUrl = val.whatsapp_webhook_url || ''
      } catch (_) {}

      let sendSuccess = false
      let errorMsg = ''

      if (webhookUrl && webhookUrl.startsWith('http')) {
        try {
          const res = $http.send({
            url: webhookUrl,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notifRec.get('payload')),
            timeout: 10,
          })
          if (res.statusCode >= 200 && res.statusCode < 300) {
            sendSuccess = true
          } else {
            errorMsg = 'HTTP ' + res.statusCode
          }
        } catch (httpErr) {
          errorMsg = httpErr.message
        }
      } else {
        // Manual / Direct mode
        sendSuccess = true
      }

      if (sendSuccess) {
        notifRec.set('status', webhookUrl ? 'enviado' : 'manual')
        notifRec.set('sent_at', new Date().toISOString())
        $app.save(notifRec)

        // Update crisis_alerts sent_status if related
        const relId = notifRec.getString('related_id')
        if (relId && notifRec.getString('related_type') === 'crisis_alert') {
          try {
            const crisisRec = $app.findRecordById('crisis_alerts', relId)
            if (crisisRec) {
              crisisRec.set('sent_status', webhookUrl ? 'enviado' : 'manual')
              crisisRec.set('sent_at', new Date().toISOString())
              if (crisisRec.getString('status') === 'nota_pronta') {
                crisisRec.set('status', 'notificado')
              }
              $app.save(crisisRec)
            }
          } catch (_) {}
        }
      } else {
        notifRec.set('status', 'falhou')
        notifRec.set('error', errorMsg)
        $app.save(notifRec)
      }

      return e.json(200, {
        success: sendSuccess,
        status: notifRec.getString('status'),
        error: errorMsg || null,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
