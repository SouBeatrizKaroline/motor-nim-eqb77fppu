import { useState, useEffect } from 'react'
import { Bell, Wifi, RefreshCw, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import { getNotifications } from '@/services/nim'

interface HeaderProps {
  title: string
  onOpenMobileSidebar?: () => void
}

export function Header({ title, onOpenMobileSidebar }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.items || [])
      setUnreadCount(res.items.filter((n: any) => n.status === 'pendente').length)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useRealtime('notifications', () => {
    loadNotifications()
  })

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">{title}</h1>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {/* V-Tracker Status */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>V-Tracker:</span>
          <span className="font-semibold text-emerald-400">Conectado</span>
        </div>

        {/* Real-time sync badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/50 text-xs text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Sincronizado</span>
        </div>

        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-4 text-[10px] bg-rose-500 text-white flex items-center justify-center rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 bg-slate-900 border-slate-800 text-slate-100 shadow-xl"
            align="end"
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Notificações Recentes</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400"
                onClick={loadNotifications}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
              {notifications.length === 0 ? (
                <p className="p-4 text-xs text-center text-slate-400">
                  Nenhuma notificação no momento
                </p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-800/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                        {n.channel}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.created).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">
                      {n.payload?.mensagem || 'Alerta de notificação'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
