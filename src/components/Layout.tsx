import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

const titleMap: Record<string, string> = {
  '/': 'Painel de Comando',
  '/alertas': 'Gestão de Alertas de Crise',
  '/discursos': 'Gerador de Discursos de Plenário',
  '/roteiros': 'Roteiros de Retenção (Reels/TikTok)',
  '/emendas': 'Módulo de Emendas Parlamentares',
  '/assistente': 'Assistente NIM (Inteligência)',
  '/configuracoes': 'Configurações do Sistema',
}

export default function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()

  const currentTitle =
    titleMap[location.pathname] ||
    (location.pathname.startsWith('/alertas/') ? 'Detalhes do Alerta' : 'Motor NIM')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={currentTitle} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
