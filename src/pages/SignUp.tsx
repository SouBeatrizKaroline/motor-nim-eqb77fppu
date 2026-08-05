import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      toast({
        title: 'Senhas divergentes',
        description: 'A senha e a confirmação devem ser idênticas.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, name)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Verifique as informações.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Cadastro realizado', description: 'Sua conta foi criada com sucesso.' })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl mb-2">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Criar Conta no Imagis</h1>
          <p className="text-[10px] text-cyan-400 font-mono tracking-wider">
            Imagis — Inteligência Estratégica para Comunicação Institucional, Gestão de Reputação e
            Apoio à Decisão Baseado em Dados
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg">Registro de Assessor / Mandato</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Preencha os dados do gabinete parlamentar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Nome completo / Mandato</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gabinete Dep. João Silva"
                    className="pl-9 bg-slate-950 border-slate-800"
                  />
                </div>
              </div>

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
                    className="pl-9 bg-slate-950 border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Senha (mínimo 8 caracteres)</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-slate-950 border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-slate-950 border-slate-800"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold py-2.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                <span>Concluir Cadastro</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              Já tem cadastro?{' '}
              <Link to="/login" className="text-cyan-400 font-bold hover:underline">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
