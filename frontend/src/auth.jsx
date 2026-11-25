import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { aoEncerrarSessao, api, lerTokens, salvarTokens } from './api.js'

const AuthContexto = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined)
  const versaoDaSessao = useRef(0)

  const encerrar = useCallback(() => {
    versaoDaSessao.current += 1
    setUsuario(null)
  }, [])

  const recarregar = useCallback(async () => {
    const versao = ++versaoDaSessao.current
    const origem = lerTokens()?.refresh
    if (!origem) {
      setUsuario(null)
      return null
    }
    let dados = null
    try {
      dados = await api('/api/auth/me/')
    } catch {
      dados = null
    }
    if (versao !== versaoDaSessao.current || lerTokens()?.refresh !== origem) return null
    setUsuario(dados)
    return dados
  }, [])

  useEffect(() => {
    recarregar()
    return aoEncerrarSessao(encerrar)
  }, [recarregar, encerrar])

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
    encerrar()
  }, [encerrar])

  const valor = useMemo(
    () => ({ usuario, entrar, cadastrar, sair, recarregar }),
    [usuario, entrar, cadastrar, sair, recarregar],
  )

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
}

export function useAuth() {
  return useContext(AuthContexto)
}
