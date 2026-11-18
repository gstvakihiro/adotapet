import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import {
  AlternarStatus, Aviso, Caracteristicas, Carregando, FotoAnimal, Pilulas, SeloStatusAnimal,
} from '../componentes/Comuns.jsx'
import { Lapis, Mais } from '../componentes/Icones.jsx'
import { cidadeUf } from '../formato.js'
import './MeusAnimais.css'

const VAZIO_FILTRO = {
  disponivel: 'Nenhum animal disponível no momento',
  adotado: 'Nenhum animal adotado ainda',
  pendentes: 'Nenhum animal com solicitação sem resposta',
}

export function useTrocaStatus(aoTrocar) {
  const { recarregar } = useAuth()
  const [ocupado, setOcupado] = useState(null)
  const [aviso, setAviso] = useState(null)

  const trocar = async (animal, status, { desfazendo = false } = {}) => {
    setOcupado(animal.id)
    setAviso(null)
    try {
      const atualizado = await api(`/api/meus-animais/${animal.id}/`, { metodo: 'PATCH', dados: { status } })
      aoTrocar(atualizado)
      recarregar()
      if (!desfazendo) {
        setAviso({
          tipo: 'sucesso',
          animal: atualizado,
          anterior: animal.status,
          texto: status === 'adotado'
            ? `${atualizado.nome} agora está como adotado e não aparece mais na busca.`
            : `${atualizado.nome} voltou a aparecer na busca.`,
        })
      }
    } catch {
      setAviso({ tipo: 'erro', texto: 'Não foi possível salvar. Confira sua conexão e tente de novo.' })
    } finally {
      setOcupado(null)
    }
  }

  const avisoElemento = aviso && (
    <Aviso
      tipo={aviso.tipo}
      acao={aviso.anterior && (
        <button type="button" className="link-botao" onClick={() => trocar(aviso.animal, aviso.anterior, { desfazendo: true })}>
          Desfazer
        </button>
      )}
    >
      {aviso.texto}
    </Aviso>
  )

  return { trocar, ocupado, avisoElemento }
}

function textoInteressados(animal) {
  if (animal.pendentes === 0) return null
  return animal.pendentes === 1 ? '1 solicitação sem resposta' : `${animal.pendentes} solicitações sem resposta`
}

export default function MeusAnimais() {
  const [busca, setBusca] = useSearchParams()
  const local = useLocation()
  const [animais, setAnimais] = useState([])
  const [estado, setEstado] = useState('carregando')
  const filtro = busca.get('filtro') || 'todos'

  const carregar = useCallback(() => {
    setEstado('carregando')
    api('/api/meus-animais/')
      .then((dados) => {
        setAnimais(dados)
        setEstado('pronto')
      })
      .catch(() => setEstado('erro'))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const { trocar, ocupado, avisoElemento } = useTrocaStatus((atualizado) =>
    setAnimais((lista) => lista.map((a) => (a.id === atualizado.id ? atualizado : a))),
  )

  const visiveis = animais.filter((a) => {
    if (filtro === 'pendentes') return a.pendentes > 0
    if (filtro === 'todos') return true
    return a.status === filtro
  })
  const mudarFiltro = (valor) => setBusca(valor === 'todos' ? {} : { filtro: valor }, { replace: true })

  return (
    <main className="conteudo">
      <div className="meus-titulo">
        <div className="titulo-pagina">
          <h1>Meus animais</h1>
          <p>Os animais que você cadastrou. Quando um for adotado, troque o status: ele sai da busca, mas continua aqui.</p>
        </div>
        <Link to="/meus-animais/novo" className="botao botao-primario"><Mais /> Cadastrar animal</Link>
      </div>

      {local.state?.mensagem && <Aviso>{local.state.mensagem}</Aviso>}
      {avisoElemento}
      {estado === 'carregando' && <Carregando />}
      {estado === 'erro' && (
        <Aviso tipo="erro" acao={<button type="button" className="link-botao" onClick={carregar}>Tentar de novo</button>}>
          Não foi possível carregar seus animais.
        </Aviso>
      )}
      {estado === 'pronto' && animais.length === 0 && (
        <div className="cartao vazio">
          <h3>Você ainda não cadastrou nenhum animal</h3>
          <p>Cadastre o primeiro: com uma foto e alguns dados, ele já aparece para quem quer adotar.</p>
          <Link to="/meus-animais/novo" className="botao botao-primario"><Mais /> Cadastrar animal</Link>
        </div>
      )}
      {estado === 'pronto' && animais.length > 0 && (
        <>
          <Pilulas
            rotulo="Filtrar por status"
            valor={filtro}
            aoMudar={mudarFiltro}
            opcoes={[
              ['todos', 'Todos', animais.length],
              ['disponivel', 'Disponíveis', animais.filter((a) => a.status === 'disponivel').length],
              ['adotado', 'Adotados', animais.filter((a) => a.status === 'adotado').length],
              ['pendentes', 'Com solicitações', animais.filter((a) => a.pendentes > 0).length],
            ]}
          />
          {visiveis.length === 0 ? (
            <div className="cartao vazio">
              <h3>{VAZIO_FILTRO[filtro]}</h3>
              <button type="button" className="botao botao-neutro" onClick={() => mudarFiltro('todos')}>Ver todos</button>
            </div>
          ) : (
            <div className="grade grade-meus">
              {visiveis.map((animal) => (
                <article key={animal.id} className="cartao cartao-animal">
                  <FotoAnimal animal={animal} selo={<SeloStatusAnimal status={animal.status} />} />
                  <div className="cartao-animal-corpo">
                    <h3 className="uma-linha">{animal.nome}</h3>
                    <Caracteristicas animal={animal} />
                    <p className="secundario uma-linha">{cidadeUf(animal)}</p>
                    <p className={`interessados-resumo${animal.pendentes ? ' com-pendentes' : ''}`}>
                      {animal.pendentes > 0 && <span className="contador">{animal.pendentes}</span>}
                      {textoInteressados(animal) ?? 'Nenhuma solicitação sem resposta'}
                    </p>
                    <AlternarStatus status={animal.status} ocupado={ocupado === animal.id} aoMudar={(status) => trocar(animal, status)} />
                    <div className="cartao-acoes">
                      <Link to={`/meus-animais/${animal.id}/interessados`} className="botao botao-secundario">Ver interessados</Link>
                      <Link to={`/meus-animais/${animal.id}/editar`} className="botao botao-neutro"><Lapis tamanho={16} /> Editar</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
