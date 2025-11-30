import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

type LogincardProps = {
  className?: string;
};

export function Logincard({ className }: LogincardProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")   // ✅ STATE DO NOME
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false) // ✅ arrumado
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          ...(isRegister ? { name: name } : {})  // ✅ sintaxe correta
        })
      })

      const data = await response.json()

      if (data.success) {
        // Salva token e usuário no localStorage para sessão no frontend.
        // Comentário: o token será usado em requests que exigem autorização
        // (ex: escolher avatar). O user é gravado para exibir avatar/nome
        // sem precisar chamar /auth/me em cada carregamento.
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        // Navega para a tela de escolha de avatar (ou fluxo principal)
        navigate("/init")
      } else {
        // mostrar erros de validação retornados pelo backend quando disponíveis
        if (data && data.errors && Array.isArray(data.errors) && data.errors.length) {
          const msgs = data.errors.map((e: any) => e.msg || `${e.param} inválido`).join('; ')
          setError(msgs)
        } else {
          setError(data.message || "Erro inesperado")
        }
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`w-full max-w-sm ${className ?? ""}`}>
      <CardHeader>
        <CardTitle className="text-left">
          {isRegister ? "Crie sua conta" : "Acesse a sua conta"}
        </CardTitle>

        <CardDescription className="text-left">
          {isRegister
            ? "Preencha os dados para começar sua jornada heroica!"
            : "Insira seu e-mail abaixo"}
        </CardDescription>

        <CardAction>
          <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Cadastrar"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">

            {isRegister && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                {!isRegister && (
                  <a className="ml-auto text-sm hover:underline" href="#">
                    Esqueceu sua senha?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? isRegister
              ? "Cadastrando..."
              : "Entrando..."
            : isRegister
            ? "Cadastrar"
            : "Login"}
        </Button>
      </CardFooter>
    </Card>
  )
}