import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    pb.collection('users')
      .confirmVerification(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 text-center">
        <CardHeader>
          <CardTitle>Verificação de E-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-400">Confirmando seu e-mail...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="py-6 flex flex-col items-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <p className="text-base font-bold text-white">E-mail verificado com sucesso!</p>
              <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold">
                <Link to="/login">Ir para o Login</Link>
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="py-6 flex flex-col items-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-400" />
              <p className="text-base font-bold text-rose-300">Falha ao verificar e-mail.</p>
              <p className="text-xs text-slate-400">
                O token pode ser inválido ou já ter expirado.
              </p>
              <Button asChild variant="outline" className="border-slate-700 text-slate-200">
                <Link to="/login">Voltar ao Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
