import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Sparkles,
  LayoutDashboard,
  Brain,
  AlertTriangle,
  FileText,
  Video,
  Wand2,
  FileSpreadsheet,
  Bot,
  Settings,
  Calendar,
  Search,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: externalOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, setIsOpen])

  const runCommand = (command: () => void) => {
    setIsOpen(false)
    command()
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Digite um comando ou busque no Imagis... (ex: 'Novo post', 'Alertas')" />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações Rápidas do Núcleo Criativo">
          <CommandItem onSelect={() => runCommand(() => navigate('/estudio?action=generate'))}>
            <Wand2 className="mr-2 h-4 w-4 text-amber-500" />
            <span>Gerar Novo Conteúdo com IA (CÓRTEX)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/estudio?tab=calendar'))}>
            <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Ver Calendário Editorial & Agendamentos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/estudio?tab=brand'))}>
            <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Acessar Guia da Marca & Identidade</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Módulos & Navegação">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-blue-500" />
            <span>Visão Geral / Dashboard Executivo</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/inteligencia'))}>
            <Brain className="mr-2 h-4 w-4 text-cyan-500" />
            <span>Inteligência Estratégica & Escuta Social</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/estudio'))}>
            <Sparkles className="mr-2 h-4 w-4 text-violet-500" />
            <span>Núcleo Criativo Imagis</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/alertas'))}>
            <AlertTriangle className="mr-2 h-4 w-4 text-rose-500" />
            <span>Gestão de Crises & Alertas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/discursos'))}>
            <FileText className="mr-2 h-4 w-4 text-blue-400" />
            <span>Gerador de Discursos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/roteiros'))}>
            <Video className="mr-2 h-4 w-4 text-pink-500" />
            <span>Roteiros de Retenção (Reels/TikTok)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/emendas'))}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-400" />
            <span>Cruzamento de Emendas & Demandas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/assistente'))}>
            <Bot className="mr-2 h-4 w-4 text-amber-400" />
            <span>Agente Copiloto Imagis</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/configuracoes'))}>
            <Settings className="mr-2 h-4 w-4 text-slate-400" />
            <span>Configurações do Sistema</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Aparência">
          <CommandItem
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-indigo-400" />
            )}
            <span>Alternar para Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
