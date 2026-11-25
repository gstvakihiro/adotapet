const CHAVE_TOKENS = 'adotapet.tokens'
const EVENTO_SESSAO = 'adotapet:sessao'

export function lerTokens() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_TOKENS))
  } catch {
    return null
  }
}

export function salvarTokens(tokens) {
  try {
    if (tokens) localStorage.setItem(CHAVE_TOKENS, JSON.stringify(tokens))
    else localStorage.removeItem(CHAVE_TOKENS)
  } catch {
    return
  }
  if (!tokens) window.dispatchEvent(new Event(EVENTO_SESSAO))
}

export function aoEncerrarSessao(funcao) {
  window.addEventListener(EVENTO_SESSAO, funcao)
  return () => window.removeEventListener(EVENTO_SESSAO, funcao)
}

export class ErroApi extends Error {
  constructor(status, dados) {
    super(status === 0 ? 'Sem conexão' : `Erro ${status}`)
    this.status = status
    this.dados = dados && typeof dados === 'object' ? dados : {}
  }

  get semConexao() {
    return this.status === 0 || this.status >= 500
  }

  mensagem(campo) {
    const valor = campo ? this.dados[campo] : this.dados.detail ?? this.dados.non_field_errors
    return Array.isArray(valor) ? valor[0] : valor
  }
}

let renovacao = null

function renovarToken(tokens) {
  if (renovacao?.refresh !== tokens.refresh) {
    const promessa = fetch('/api/auth/token/renovar/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    })
      .then(
        async (resposta) => {
          if (!resposta.ok) return null
          const dados = await resposta.json()
          if (lerTokens()?.refresh !== tokens.refresh) return null
          const novos = { ...tokens, access: dados.access }
          salvarTokens(novos)
          return novos
        },
        () => {
          throw new ErroApi(0, null)
        },
      )
      .finally(() => {
        if (renovacao?.promessa === promessa) renovacao = null
      })
    renovacao = { refresh: tokens.refresh, promessa }
  }
  return renovacao.promessa
}

async function enviar(caminho, metodo, corpo, cabecalhos, access, sinal) {
  const headers = access ? { ...cabecalhos, Authorization: `Bearer ${access}` } : cabecalhos
  try {
    return await fetch(caminho, { method: metodo, headers, body: corpo, signal: sinal })
  } catch (erro) {
    if (sinal?.aborted) throw erro
    throw new ErroApi(0, null)
  }
}

export async function api(caminho, { metodo = 'GET', dados, autenticar = true, sinal } = {}) {
  const cabecalhos = {}
  let corpo
  if (dados instanceof FormData) corpo = dados
  else if (dados !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
    corpo = JSON.stringify(dados)
  }
  const tokens = autenticar ? lerTokens() : null

  let resposta = await enviar(caminho, metodo, corpo, cabecalhos, tokens?.access, sinal)

  if (resposta.status === 401 && tokens?.access) {
    const novos = tokens.refresh ? await renovarToken(tokens) : null
    if (novos) {
      resposta = await enviar(caminho, metodo, corpo, cabecalhos, novos.access, sinal)
    } else if (lerTokens()?.refresh === tokens.refresh) {
      salvarTokens(null)
      resposta = await enviar(caminho, metodo, corpo, cabecalhos, null, sinal)
    } else {
      throw new ErroApi(401, null)
    }
  }

  const texto = await resposta.text()
  let conteudo = null
  try {
    conteudo = texto ? JSON.parse(texto) : null
  } catch {
    conteudo = null
  }
  if (!resposta.ok) throw new ErroApi(resposta.status, conteudo)
  return conteudo
}
