import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react'
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
        title: 'Erro ao acessar conta',
        description: 'Verifique suas credenciais de e-mail e senha.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Acesso autorizado',
        description: 'Bem-vindo ao Motor NIM.',
      })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/20 mb-2">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">MOTOR NIM</h1>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">
            Núcleo de Inteligência de Mandato
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur text-slate-100 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100">Entrar na Sala de Comando</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Digite suas credenciais registradas para gerenciar alertas, discursos e emendas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">E-mail institucional</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="assessor@mandato.gov.br"
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300">Senha de acesso</Label>
                  <Link to="/forgot-password" className="text-xs text-cyan-400 hover:underline">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold py-2.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                <span>Acessar Painel</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              Ainda não possui conta?{' '}
              <Link to="/signup" className="text-cyan-400 font-bold hover:underline">
                Cadastrar mandato
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
