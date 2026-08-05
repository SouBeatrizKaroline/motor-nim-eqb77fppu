import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

const titleMap: Record<string, string> = {
  '/': 'Central de Comando',
  '/alertas': 'Radar de Crises',
  '/discursos': 'Estúdio de Discursos',
  '/roteiros': 'Estúdio de Conteúdo',
  '/estudio': 'Núcleo Criativo',
  '/emendas': 'Matching Orçamentário',
  '/inteligencia': 'Central de Inteligência',
  '/assistente': 'Copiloto Estratégico',
  '/configuracoes': 'Configurações do Sistema',
}

export default function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()

  const currentTitle =
    titleMap[location.pathname] ||
    (location.pathname.startsWith('/alertas/') ? 'Detalhes da Crise' : 'CÓRTEX')

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans antialiased">
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={currentTitle} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
