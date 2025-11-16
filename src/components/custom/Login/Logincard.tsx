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

    const endpoint = isRegister ? "/auth/register" : "/auth/login"

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          ...(isRegister ? { name: name } : {})  // ✅ sintaxe correta
        })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        navigate("/init")
      } else {
        setError(data.message || "Erro inesperado")
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