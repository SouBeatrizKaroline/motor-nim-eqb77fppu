import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { confirmEmailChange } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast({ title: 'Token ausente', variant: 'destructive' })
      return
    }

    setLoading(true)
    const { error } = await confirmEmailChange(token, password)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao alterar e-mail', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'E-mail alterado',
        description: 'Por favor, entre novamente com o novo e-mail.',
      })
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader>
          <CardTitle>Confirmar Novo E-mail</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Digite sua senha atual para autorizar a alteração de e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Senha atual</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-800"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 font-bold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Alteração
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
