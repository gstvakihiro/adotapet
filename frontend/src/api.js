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

let renovacaoEmAndamento = null

function renovarToken() {
  const tokens = lerTokens()
  if (!tokens?.refresh) return Promise.resolve(false)
  renovacaoEmAndamento ??= fetch('/api/auth/token/renovar/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
    .then(async (resposta) => {
      if (!resposta.ok) return false
      const dados = await resposta.json()
      salvarTokens({ ...tokens, access: dados.access })
      return true
    })
    .catch(() => false)
    .finally(() => {
      renovacaoEmAndamento = null
    })
  return renovacaoEmAndamento
}

export async function api(caminho, { metodo = 'GET', dados, autenticar = true } = {}, jaTentou = false) {
  const cabecalhos = {}
  let corpo
  if (dados instanceof FormData) corpo = dados
  else if (dados !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
    corpo = JSON.stringify(dados)
  }
  const tokens = lerTokens()
  if (autenticar && tokens?.access) cabecalhos.Authorization = `Bearer ${tokens.access}`

  let resposta
  try {
    resposta = await fetch(caminho, { method: metodo, headers: cabecalhos, body: corpo })
  } catch {
    throw new ErroApi(0, null)
  }

  if (resposta.status === 401 && autenticar && tokens?.access && !jaTentou) {
    if (await renovarToken()) return api(caminho, { metodo, dados, autenticar }, true)
    salvarTokens(null)
    return api(caminho, { metodo, dados, autenticar: false }, true)
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
