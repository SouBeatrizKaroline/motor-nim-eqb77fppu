import { useEffect, useRef } from 'react'
import type { RecordModel, RecordSubscription } from 'pocketbase'

import pb from '@/lib/pocketbase/client'

let realtimeInitialized = false

function initRealtimeResilience() {
  if (realtimeInitialized) return
  realtimeInitialized = true

  const realtime = pb.realtime as any
  if (!realtime) return

  const originalSendSubs = realtime.sendSubscriptions?.bind(realtime)
  if (typeof originalSendSubs === 'function') {
    realtime.sendSubscriptions = async function (...args: any[]) {
      try {
        return await originalSendSubs(...args)
      } catch {
        try {
          realtime.disconnect()
        } catch {
          /* ignore */
        }
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason
      const msg = String(reason?.message || reason || '').toLowerCase()
      const url = String(reason?.url || reason?.response?.url || '').toLowerCase()
      if (
        msg.includes('invalid realtime client') ||
        msg.includes('/api/realtime') ||
        url.includes('/api/realtime')
      ) {
        event.preventDefault()
        try {
          realtime.disconnect()
        } catch {
          /* ignore */
        }
      }
    })
  }
}

function waitForRealtimeConnection(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const realtime = pb.realtime as any

    if (realtime?.clientId) {
      resolve()
      return
    }

    if (!realtime?.isConnected) {
      try {
        realtime?.connect()
      } catch {
        /* ignore */
      }
    }

    let elapsed = 0
    const interval = 50

    const timer = setInterval(() => {
      elapsed += interval
      if (realtime?.clientId) {
        clearInterval(timer)
        resolve()
      } else if (elapsed >= timeoutMs) {
        clearInterval(timer)
        reject(new Error('Realtime connection timeout'))
      } else if (!realtime?.isConnected) {
        try {
          realtime?.connect()
        } catch {
          /* ignore */
        }
      }
    }, interval)
  })
}

initRealtimeResilience()

export function useRealtime<TRecord extends RecordModel = RecordModel>(
  collectionName: string,
  callback: (data: RecordSubscription<TRecord>) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    const MAX_RETRIES = 5
    const BASE_DELAY = 500

    const subscribeWithRetry = async () => {
      if (cancelled) return

      try {
        await waitForRealtimeConnection()
        const fn = await pb.collection<TRecord>(collectionName).subscribe('*', (e) => {
          callbackRef.current(e)
        })
        if (cancelled) {
          fn().catch(() => {})
        } else {
          unsubscribeFn = fn
          attempts = 0
        }
      } catch {
        if (cancelled || attempts >= MAX_RETRIES) return
        attempts++
        try {
          ;(pb.realtime as any)?.disconnect()
        } catch {
          /* ignore */
        }
        retryTimer = setTimeout(() => subscribeWithRetry(), BASE_DELAY * attempts)
      }
    }

    subscribeWithRetry()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      if (unsubscribeFn) {
        unsubscribeFn().catch(() => {})
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
