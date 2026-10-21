import { useEffect, useState } from 'react'
import { API_URL, getHealth } from './api.js'

// Tela provisória da Fase 0: só confirma que frontend, API e banco
// estão conversando. Será substituída pelas telas reais na Fase 5.
export default function App() {
  const [estado, setEstado] = useState({ carregando: true })

  useEffect(() => {
    getHealth()
      .then((dados) => setEstado({ dados }))
      .catch((erro) => setEstado({ erro: erro.message }))
  }, [])

  const apiOk = Boolean(estado.dados)
  const bancoOk = estado.dados?.banco === 'ok'

  return (
    <main className="pagina">
      <h1>AdotaPet</h1>
      <p className="subtitulo">Ambiente de desenvolvimento · Fase 0</p>

      <ul className="servicos" aria-live="polite">
        <Servico nome="Frontend (React)" ok detalhe="rodando nesta página" />
        <Servico
          nome="API (Django)"
          ok={apiOk}
          carregando={estado.carregando}
          detalhe={estado.erro ?? API_URL}
        />
        <Servico
          nome="Banco de dados"
          ok={bancoOk}
          carregando={estado.carregando}
          detalhe={estado.dados?.motor ?? 'sem resposta da API'}
        />
      </ul>
    </main>
  )
}

function Servico({ nome, ok, carregando, detalhe }) {
  const status = carregando ? 'verificando…' : ok ? 'ok' : 'erro'
  return (
    <li className={`servico ${carregando ? '' : ok ? 'ok' : 'erro'}`}>
      <span className="nome">{nome}</span>
      <span className="status">{status}</span>
      <span className="detalhe">{detalhe}</span>
    </li>
  )
}
