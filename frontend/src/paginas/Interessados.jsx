import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import {
  AlternarStatus, Aviso, Caracteristicas, Carregando, Confirmar, FotoAnimal, Pilulas, SeloSolicitacao, SeloStatusAnimal,
} from '../componentes/Comuns.jsx'
import { Check, Fechar, Lapis, Seta } from '../componentes/Icones.jsx'
import { cidadeUf, data, iniciais, plural } from '../formato.js'
import { useTrocaStatus } from './MeusAnimais.jsx'
import { Contato } from './MinhasSolicitacoes.jsx'
import './Interessados.css'

const VAZIO_FILTRO = {
  pendente: 'Nenhuma solicitação pendente',
  aceita: 'Nenhuma solicitação aceita',
  recusada: 'Nenhuma solicitação recusada',
}

export default function Interessados() {
  const { id } = useParams()
  const { recarregar } = useAuth()
  const [animal, setAnimal] = useState(null)
  const [lista, setLista] = useState([])
  const [estado, setEstado] = useState('carregando')
  const [filtro, setFiltro] = useState('todas')
  const [ocupada, setOcupada] = useState(null)
  const [confirmar, setConfirmar] = useState(null)
  const [aviso, setAviso] = useState(null)

  const carregar = useCallback(() => {
    setEstado('carregando')
    Promise.all([api(`/api/meus-animais/${id}/`), api(`/api/meus-animais/${id}/solicitacoes/`)])
      .then(([dadosAnimal, solicitacoes]) => {
        setAnimal(dadosAnimal)
        setLista(solicitacoes)
        setEstado('pronto')
      })
      .catch((erro) => setEstado(erro.status === 404 ? 'nao-encontrado' : 'erro'))
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  const { trocar, ocupado, avisoElemento } = useTrocaStatus(setAnimal)

  const responder = async (solicitacao, status, { desfazendo = false } = {}) => {
    setOcupada(solicitacao.id)
    setAviso(null)
    try {
      const atualizada = await api(`/api/solicitacoes/${solicitacao.id}/`, { metodo: 'PATCH', dados: { status } })
      setLista((atual) => atual.map((s) => (s.id === atualizada.id ? atualizada : s)))
      recarregar()
      if (desfazendo) return
      if (status === 'aceita') {
        setAviso({ tipo: 'sucesso', texto: `Você aceitou a solicitação de ${atualizada.adotante.nome}. Use o contato para combinar os próximos passos.` })
      } else if (status === 'recusada') {
        setAviso({ tipo: 'sucesso', texto: `Você recusou a solicitação de ${atualizada.adotante.nome}.`, desfazer: atualizada })
      }
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.mensagem('status') || 'Não foi possível salvar. Confira sua conexão e tente de novo.' })
    } finally {
      setOcupada(null)
    }
  }

  if (estado === 'carregando') return <main className="conteudo"><Carregando /></main>
  if (estado !== 'pronto') {
    return (
      <main className="conteudo">
        <div className="cartao vazio">
          <h2>{estado === 'nao-encontrado' ? 'Animal não encontrado' : 'Não foi possível carregar'}</h2>
          <Link to="/meus-animais" className="botao botao-primario">Voltar para Meus animais</Link>
        </div>
      </main>
    )
  }

  const contar = (status) => lista.filter((s) => s.status === status).length
  const visiveis = filtro === 'todas' ? lista : lista.filter((s) => s.status === filtro)
  const temAceita = contar('aceita') > 0

  return (
    <main className="conteudo">
      <Link to="/meus-animais" className="voltar"><Seta tamanho={18} /> Meus animais</Link>
      <div className="interessados">
        <aside className="cartao resumo-animal">
          <FotoAnimal animal={animal} />
          <div className="resumo-corpo">
            <SeloStatusAnimal status={animal.status} />
            <h3 className="uma-linha">{animal.nome}</h3>
            <Caracteristicas animal={animal} />
            <p className="secundario uma-linha">{cidadeUf(animal)}</p>
            <p className="rotulo resumo-status">Status</p>
            <AlternarStatus status={animal.status} ocupado={Boolean(ocupado)} aoMudar={(status) => trocar(animal, status)} />
            <p className="ajuda">Adoção combinada? Marque como adotado para tirar o animal da busca.</p>
            <Link to={`/meus-animais/${animal.id}/editar`} className="botao botao-neutro botao-largo"><Lapis tamanho={16} /> Editar animal</Link>
          </div>
        </aside>

        <section className="interessados-lista">
          <div className="titulo-pagina">
            <h1>Interessados em {animal.nome}</h1>
            <p>
              {plural(lista.length, 'solicitação', 'solicitações')}
              {contar('pendente') > 0 && ` · ${contar('pendente')} aguardando sua resposta`}. O contato aparece quando você aceita.
            </p>
          </div>
          {avisoElemento}
          {aviso && (
            <Aviso
              tipo={aviso.tipo}
              acao={aviso.desfazer && (
                <button type="button" className="link-botao" onClick={() => { setAviso(null); responder(aviso.desfazer, 'pendente', { desfazendo: true }) }}>
                  Desfazer
                </button>
              )}
            >
              {aviso.texto}
            </Aviso>
          )}

          {lista.length === 0 ? (
            <div className="cartao vazio">
              <h3>Nenhum interessado ainda</h3>
              <p>Quando alguém demonstrar interesse em {animal.nome}, a solicitação aparece aqui.</p>
            </div>
          ) : (
            <>
              <Pilulas
                rotulo="Filtrar por status"
                valor={filtro}
                aoMudar={setFiltro}
                opcoes={[
                  ['todas', 'Todas', lista.length],
                  ['pendente', 'Pendentes', contar('pendente')],
                  ['aceita', 'Aceitas', contar('aceita')],
                  ['recusada', 'Recusadas', contar('recusada')],
                ]}
              />
              {visiveis.length === 0 ? (
                <div className="cartao vazio">
                  <h3>{VAZIO_FILTRO[filtro]}</h3>
                  <button type="button" className="botao botao-neutro" onClick={() => setFiltro('todas')}>Ver todas</button>
                </div>
              ) : (
                <ul className="lista-interessados">
                  {visiveis.map((s) => (
                    <li key={s.id} className="cartao interessado">
                      <div className="interessado-linha">
                        <span className="avatar">{iniciais(s.adotante.nome)}</span>
                        <div className="interessado-nome">
                          <strong className="uma-linha">{s.adotante.nome}</strong>
                          <p className="secundario">Recebida em {data(s.criado_em)}</p>
                        </div>
                        <SeloSolicitacao status={s.status} />
                        {s.status === 'pendente' && (
                          <div className="interessado-acoes">
                            <button type="button" className="botao botao-neutro" disabled={ocupada === s.id} onClick={() => responder(s, 'recusada')}>
                              <Fechar tamanho={16} /> Recusar
                            </button>
                            <button
                              type="button"
                              className="botao botao-primario"
                              disabled={ocupada === s.id || temAceita}
                              title={temAceita ? 'Este animal já tem uma solicitação aceita.' : undefined}
                              onClick={() => setConfirmar(s)}
                            >
                              <Check tamanho={16} /> Aceitar
                            </button>
                          </div>
                        )}
                      </div>
                      {s.status === 'aceita' && <div className="contato-bloco"><Contato pessoa={s.adotante} /></div>}
                    </li>
                  ))}
                </ul>
              )}
              {temAceita && contar('pendente') > 0 && (
                <p className="ajuda">Este animal já tem uma solicitação aceita. As outras podem ser recusadas ou ficar pendentes.</p>
              )}
            </>
          )}
        </section>
      </div>

      {confirmar && (
        <Confirmar
          titulo={`Aceitar a solicitação de ${confirmar.adotante.nome}?`}
          rotuloConfirmar="Aceitar"
          aoCancelar={() => setConfirmar(null)}
          aoConfirmar={() => {
            const solicitacao = confirmar
            setConfirmar(null)
            responder(solicitacao, 'aceita')
          }}
        >
          Vocês dois vão ver o email e o telefone um do outro para combinar a adoção.
        </Confirmar>
      )}
    </main>
  )
}
