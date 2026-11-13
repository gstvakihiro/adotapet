import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { aoEncerrarSessao, api, lerTokens, salvarTokens } from './api.js'

const AuthContexto = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined)

  const recarregar = useCallback(async () => {
    if (!lerTokens()?.access) {
      setUsuario(null)
      return null
    }
    try {
      const dados = await api('/api/auth/me/')
      setUsuario(dados)
      return dados
    } catch {
      setUsuario(null)
      return null
    }
  }, [])

  useEffect(() => {
    recarregar()
    return aoEncerrarSessao(() => setUsuario(null))
  }, [recarregar])

  const entrar = useCallback(
    async (email, senha) => {
      const tokens = await api('/api/auth/login/', { metodo: 'POST', dados: { email, senha }, autenticar: false })
      salvarTokens(tokens)
      return recarregar()
    },
    [recarregar],
  )

  const cadastrar = useCallback(
    async (dados) => {
      const resposta = await api('/api/auth/cadastro/', { metodo: 'POST', dados, autenticar: false })
      salvarTokens({ access: resposta.access, refresh: resposta.refresh })
      return recarregar()
    },
    [recarregar],
  )

  const sair = useCallback(() => {
    salvarTokens(null)
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({ usuario, entrar, cadastrar, sair, recarregar }),
    [usuario, entrar, cadastrar, sair, recarregar],
  )

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
}

export function useAuth() {
  return useContext(AuthContexto)
}
