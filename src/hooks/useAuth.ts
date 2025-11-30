import { useEffect, useState } from 'react'

// Tipo mínimo para representar o usuário salvo no localStorage
type User = {
  id?: number
  name?: string
  nome?: string
  email?: string
  avatar?: string | null
  tipo_usuario?: string | null
}

/**
 * Hook useAuth
 * - Mantém o `user` sincronizado com localStorage.
 * - Expõe helpers: setAuthUser, getToken e logout.
 * - logout remove token/user do localStorage, atualiza o estado e (por padrão)
 *   redireciona para `/login` para forçar novo fluxo de autenticação.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      // lê user do localStorage apenas no cliente
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      return raw ? JSON.parse(raw) : null
    } catch (err) {
      return null
    }
  })

  useEffect(() => {
    // Sincroniza alterações do estado `user` para o localStorage.
    // Se `user` for null remove a chave.
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user))
      else localStorage.removeItem('user')
    } catch (err) {
      // ignorar erros de storage
    }
  }, [user])

  const setAuthUser = (u: User | null) => setUser(u)

  const getToken = () => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('token') : null
    } catch (err) {
      return null
    }
  }

  /**
   * logout
   * - remove token e user do localStorage
   * - atualiza o estado local para null
   * - por padrão, redireciona para /login para encerrar a sessão no cliente
   *
   * Observação: não existe endpoint de logout no backend; este logout é apenas
   * cliente (limpa armazenamento). Se no futuro houver revogação de token,
   * adicione chamada ao backend aqui.
   */
  const logout = async (redirect = true) => {
    try {
      // chame o endpoint de logout no backend para revogar refresh token (se existir)
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch (err) {
        // ignorar falha na chamada de logout (iremos limpar local mesmo assim)
      }

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (err) {
      // ignore
    }
    setUser(null)
    if (redirect && typeof window !== 'undefined') {
      // redireciona para a tela de login para reiniciar o fluxo
      window.location.href = '/login'
    }
  }

  return { user, setAuthUser, getToken, logout }
}
