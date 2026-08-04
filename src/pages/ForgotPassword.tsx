import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { requestPasswordReset } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await requestPasswordReset(email)
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader>
          <CardTitle>Recuperação de Senha</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Informe seu e-mail cadastrado para receber o link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">Solicitação enviada!</p>
              <p className="text-xs text-slate-400">
                Verifique a caixa de entrada de <strong>{email}</strong>.
              </p>
              <Button asChild variant="outline" className="border-slate-800 text-slate-200">
                <Link to="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">E-mail registrado</Label>
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enviar Link de Redefinição
              </Button>
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar ao Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
