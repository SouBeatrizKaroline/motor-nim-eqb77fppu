import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Brain,
  AlertTriangle,
  FileText,
  Video,
  Sparkles,
  FileSpreadsheet,
  Bot,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Visão Geral', path: '/', icon: LayoutDashboard },
  { name: 'Inteligência Estratégica', path: '/inteligencia', icon: Brain },
  { name: 'Núcleo Criativo', path: '/estudio', icon: Sparkles, badge: 'CÓRTEX' },
  { name: 'Alertas de Crise', path: '/alertas', icon: AlertTriangle },
  { name: 'Gerador de Discursos', path: '/discursos', icon: FileText },
  { name: 'Roteiros de Retenção', path: '/roteiros', icon: Video },
  { name: 'Emendas & Demandas', path: '/emendas', icon: FileSpreadsheet },
  { name: 'Copiloto Imagis', path: '/assistente', icon: Bot },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card/60 backdrop-blur-md">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
            I
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight tracking-wide">MOTOR IMAGIS</span>
            <span className="text-[10px] text-muted-foreground font-mono">Imagis Engine</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground',
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                  )}
                >
                  {item.badge === 'CÓRTEX' ? 'IMAGIS' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-foreground">Status do Sistema</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-[11px]">V-Tracker & Imagis Conectados</p>
        </div>
      </div>
    </aside>
  )
}
