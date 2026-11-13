import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.js'
import { Aviso, Caracteristicas, Carregando, FotoAnimal, Pilulas, SeloSolicitacao } from '../componentes/Comuns.jsx'
import { Email, Telefone } from '../componentes/Icones.jsx'
import { cidadeUf, data } from '../formato.js'
import './Solicitacoes.css'

const VAZIO_FILTRO = {
  pendente: 'Nenhuma solicitação pendente',
  aceita: 'Nenhuma solicitação aceita',
  recusada: 'Nenhuma solicitação recusada',
}

export function Contato({ pessoa }) {
  if (!pessoa.email) return null
  return (
    <div className="contato">
      <a href={`mailto:${pessoa.email}`}><Email tamanho={18} /> {pessoa.email}</a>
      {pessoa.telefone && (
        <a href={`tel:${pessoa.telefone.replace(/[^\d+]/g, '')}`}><Telefone tamanho={18} /> {pessoa.telefone}</a>
      )}
    </div>
  )
}

export default function MinhasSolicitacoes() {
  const [lista, setLista] = useState([])
  const [estado, setEstado] = useState('carregando')
  const [filtro, setFiltro] = useState('todas')

  const carregar = useCallback(() => {
    setEstado('carregando')
    api('/api/solicitacoes/')
      .then((dados) => {
        setLista(dados)
        setEstado('pronto')
      })
      .catch(() => setEstado('erro'))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const contar = (status) => lista.filter((s) => s.status === status).length
  const visiveis = filtro === 'todas' ? lista : lista.filter((s) => s.status === filtro)

  return (
    <main className="conteudo conteudo-estreito">
      <div className="titulo-pagina">
        <h1>Minhas solicitações</h1>
        <p>Acompanhe os animais em que você demonstrou interesse. O contato do responsável aparece quando ele aceita.</p>
      </div>

      {estado === 'carregando' && <Carregando />}
      {estado === 'erro' && (
        <Aviso tipo="erro" acao={<button type="button" className="link-botao" onClick={carregar}>Tentar de novo</button>}>
          Não foi possível carregar suas solicitações.
        </Aviso>
      )}
      {estado === 'pronto' && lista.length === 0 && (
        <div className="cartao vazio">
          <h3>Você ainda não demonstrou interesse em nenhum animal</h3>
          <p>Encontre um animal, abra o perfil dele e toque em Tenho interesse. Seus pedidos aparecem aqui.</p>
          <Link to="/animais" className="botao botao-primario">Ver animais para adoção</Link>
        </div>
      )}
      {estado === 'pronto' && lista.length > 0 && (
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
            <ul className="lista-solicitacoes">
              {visiveis.map((s) => (
                <li key={s.id} className="cartao linha-solicitacao">
                  <Link to={`/animais/${s.animal_dados.id}`} className="miniatura" aria-hidden="true" tabIndex={-1}>
                    <FotoAnimal animal={s.animal_dados} />
                  </Link>
                  <div className="linha-corpo">
                    <div className="linha-topo">
                      <Link to={`/animais/${s.animal_dados.id}`} className="linha-nome uma-linha">{s.animal_dados.nome}</Link>
                      <SeloSolicitacao status={s.status} />
                    </div>
                    <Caracteristicas animal={s.animal_dados} />
                    <p className="secundario uma-linha">{cidadeUf(s.animal_dados)}</p>
                    <p className="secundario">Enviada em {data(s.criado_em)}</p>
                    {s.status === 'aceita' && (
                      <div className="contato-bloco">
                        <p><strong>{s.responsavel.nome}</strong> aceitou. Combine os próximos passos:</p>
                        <Contato pessoa={s.responsavel} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}
