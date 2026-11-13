import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { Aviso, Carregando, FotoAnimal, SeloSolicitacao } from '../componentes/Comuns.jsx'
import { Coracao, Local, Seta } from '../componentes/Icones.jsx'
import { cidadeUf, idadeTexto, iniciais, rotulo } from '../formato.js'
import './DetalheAnimal.css'

function AreaInteresse({ animal, usuario, aoEnviar, enviando, avisoEnvio }) {
  const local = useLocation()
  const solicitacao = animal.minha_solicitacao

  if (animal.status === 'adotado') {
    return (
      <div className="interesse-info">
        <span className="selo selo-adotado">Adotado</span>
        <p>Este animal já foi adotado.</p>
      </div>
    )
  }
  if (usuario === null) {
    return (
      <>
        <Aviso tipo="alerta">Você precisa entrar para demonstrar interesse.</Aviso>
        <Link to={`/entrar?proximo=${encodeURIComponent(local.pathname)}`} className="botao botao-primario botao-largo botao-grande">
          <Coracao /> Tenho interesse
        </Link>
      </>
    )
  }
  if (usuario?.tipo === 'responsavel') {
    return <p className="interesse-info secundario">Só contas de adotante podem demonstrar interesse.</p>
  }
  if (solicitacao) {
    return (
      <div className="interesse-info">
        <p>
          Interesse enviado · <SeloSolicitacao status={solicitacao.status} />
        </p>
        <Link to="/minhas-solicitacoes" className="botao botao-texto">
          {solicitacao.status === 'aceita' ? 'Ver o contato em Minhas solicitações' : 'Ver em Minhas solicitações'}
        </Link>
      </div>
    )
  }
  return (
    <>
      {avisoEnvio && <Aviso tipo="erro">{avisoEnvio}</Aviso>}
      <button type="button" className="botao botao-primario botao-largo botao-grande" onClick={aoEnviar} disabled={enviando || usuario === undefined}>
        <Coracao /> {enviando ? 'Enviando…' : 'Tenho interesse'}
      </button>
    </>
  )
}

export default function DetalheAnimal() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [animal, setAnimal] = useState(null)
  const [estado, setEstado] = useState('carregando')
  const [enviando, setEnviando] = useState(false)
  const [avisoEnvio, setAvisoEnvio] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (usuario === undefined) return
    api(`/api/animais/${id}/`)
      .then((dados) => {
        setAnimal(dados)
        setEstado('pronto')
      })
      .catch((erro) => setEstado(erro.status === 404 ? 'nao-encontrado' : 'erro'))
  }, [id, usuario])

  const enviar = async () => {
    setEnviando(true)
    setAvisoEnvio('')
    try {
      const solicitacao = await api('/api/solicitacoes/', { metodo: 'POST', dados: { animal: id } })
      setAnimal((atual) => ({ ...atual, minha_solicitacao: { id: solicitacao.id, status: solicitacao.status } }))
      setEnviado(true)
    } catch (erro) {
      const mensagem = erro.mensagem('animal')
      if (mensagem?.includes('adotado')) {
        setAnimal((atual) => ({ ...atual, status: 'adotado' }))
        setAvisoEnvio(mensagem)
      } else if (mensagem) {
        setAvisoEnvio(mensagem)
      } else {
        setAvisoEnvio('Não foi possível enviar. Confira sua conexão e tente de novo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (estado === 'carregando') return <main className="conteudo"><Carregando /></main>
  if (estado !== 'pronto') {
    return (
      <main className="conteudo">
        <div className="cartao vazio">
          <h2>{estado === 'nao-encontrado' ? 'Animal não encontrado' : 'Não foi possível carregar'}</h2>
          <p>{estado === 'nao-encontrado' ? 'O link pode estar errado ou o animal foi removido.' : 'Confira sua conexão e tente de novo.'}</p>
          <Link to="/animais" className="botao botao-primario">Ver animais para adoção</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="conteudo">
      <button type="button" className="voltar link-botao" onClick={() => (window.history.length > 1 ? navegar(-1) : navegar('/animais'))}>
        <Seta tamanho={18} /> Voltar
      </button>
      <div className="detalhe">
        <FotoAnimal animal={animal} grande />
        <div className="cartao detalhe-info">
          <div>
            <h1>{animal.nome}</h1>
            <p className="detalhe-cidade"><Local tamanho={18} /> {cidadeUf(animal)}</p>
          </div>
          <dl className="detalhe-dados">
            {[
              ['Espécie', rotulo(animal.especie)],
              ['Sexo', rotulo(animal.sexo)],
              ['Idade', idadeTexto(animal.idade)],
              ['Porte', rotulo(animal.porte)],
            ].map(([titulo, valor]) => (
              <div key={titulo}>
                <dt>{titulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
          {animal.descricao && (
            <div className="detalhe-sobre">
              <h3>Sobre o animal</h3>
              <p>{animal.descricao}</p>
            </div>
          )}
          <div className="detalhe-responsavel">
            <span className="avatar avatar-responsavel">{iniciais(animal.responsavel_nome)}</span>
            <div>
              <p className="secundario">Responsável</p>
              <strong>{animal.responsavel_nome}</strong>
            </div>
          </div>
          {enviado && <Aviso>Interesse enviado. O responsável vai responder em Minhas solicitações.</Aviso>}
          <AreaInteresse animal={animal} usuario={usuario} aoEnviar={enviar} enviando={enviando} avisoEnvio={avisoEnvio} />
        </div>
      </div>
    </main>
  )
}
