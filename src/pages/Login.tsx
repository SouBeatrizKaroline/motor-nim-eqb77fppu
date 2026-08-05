import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrainCircuit, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('1aspiraqualquer@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao acessar',
        description: 'Verifique suas credenciais de e-mail e senha.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Acesso autorizado', description: 'Bem-vindo ao Imagis.' })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-xl shadow-teal-500/20 mb-2">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-wider">Imagis</h1>
          <p className="text-[10px] text-primary font-mono tracking-wider">
            Imagis — Inteligência Estratégica para Comunicação Institucional, Gestão de Reputação e
            Apoio à Decisão Baseado em Dados
          </p>
        </div>
        <Card className="border-border bg-card/90 backdrop-blur text-card-foreground shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Acessar Plataforma</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Digite suas credenciais para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">E-mail institucional</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.gov.br"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Senha de acesso</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold py-2.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                <span>Acessar</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
              Não possui conta?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                Cadastrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
