import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Zap,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Video,
  Coins,
  Bot,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { getCrisisAlerts } from '@/services/nim'
import { cn } from '@/lib/utils'

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [activeAlertsCount, setActiveAlertsCount] = useState(0)

  const loadAlerts = async () => {
    try {
      const alerts = await getCrisisAlerts()
      const active = alerts.filter(
        (a: any) => a.status !== 'resolvido' && a.status !== 'descartado',
      ).length
      setActiveAlertsCount(active)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  useRealtime('crisis_alerts', () => {
    loadAlerts()
  })

  const navItems = [
    { label: 'Painel', path: '/', icon: LayoutDashboard },
    { label: 'Alertas de Crise', path: '/alertas', icon: AlertTriangle, badge: activeAlertsCount },
    { label: 'Discursos', path: '/discursos', icon: FileText },
    { label: 'Roteiros', path: '/roteiros', icon: Video },
    { label: 'Emendas', path: '/emendas', icon: Coins },
    { label: 'Assistente NIM', path: '/assistente', icon: Bot },
    { label: 'Configurações', path: '/configuracoes', icon: Settings },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">MOTOR NIM</span>
            <span className="block text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
              Inteligência de Mandato
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="md:hidden text-slate-400"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900',
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200',
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-100 truncate">
                {user?.name || 'Assessor NIM'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'assessor@mandato.gov.br'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            title="Sair da conta"
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative flex-1 w-full max-w-xs h-full z-10 animate-fade-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
