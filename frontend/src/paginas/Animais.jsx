import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { api } from '../api.js'
import { Aviso, CartaoAnimal, Carregando } from '../componentes/Comuns.jsx'
import { Filtro, Fechar } from '../componentes/Icones.jsx'
import { ESPECIES, FAIXAS_IDADE, PORTES, SEXOS, plural } from '../formato.js'
import './Animais.css'

const GRUPOS = [
  ['especie', 'Espécie', ESPECIES],
  ['sexo', 'Sexo', SEXOS],
  ['idade', 'Idade', FAIXAS_IDADE],
  ['porte', 'Porte', PORTES],
]

function lerLista(busca, nome) {
  return (busca.get(nome) || '').split(',').filter(Boolean)
}

function Filtros({ busca, cidades, aoMudar, aoLimpar }) {
  const cidadeAtual = busca.get('cidade') ? `${busca.get('cidade')}|${busca.get('uf') || ''}` : ''
  return (
    <div className="filtros-grupos">
      {GRUPOS.map(([nome, titulo, opcoes]) => {
        const marcados = lerLista(busca, nome)
        return (
          <fieldset key={nome} className="filtro-grupo">
            <legend className="rotulo">{titulo}</legend>
            <div className="opcoes">
              {opcoes.map(([valor, texto]) => (
                <label key={valor} className="opcao">
                  <input
                    type="checkbox"
                    checked={marcados.includes(valor)}
                    onChange={(e) => {
                      const nova = e.target.checked ? [...marcados, valor] : marcados.filter((v) => v !== valor)
                      aoMudar({ [nome]: nova.join(',') })
                    }}
                  />
                  {texto}
                </label>
              ))}
            </div>
          </fieldset>
        )
      })}
      <div className="campo">
        <label htmlFor="filtro-cidade">Cidade</label>
        <select
          id="filtro-cidade"
          value={cidadeAtual}
          onChange={(e) => {
            const [cidade = '', uf = ''] = e.target.value.split('|')
            aoMudar({ cidade, uf })
          }}
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={`${c.cidade}|${c.uf}`} value={`${c.cidade}|${c.uf}`}>
              {c.cidade} – {c.uf}
            </option>
          ))}
        </select>
      </div>
      {aoLimpar && (
        <button type="button" className="botao botao-neutro" onClick={aoLimpar}>Limpar filtros</button>
      )}
    </div>
  )
}

export default function Animais() {
  const [busca, setBusca] = useSearchParams()
  const [cidades, setCidades] = useState([])
  const [pagina, setPagina] = useState({ results: [], count: 0, next: null })
  const [estado, setEstado] = useState('carregando')
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)

  const consulta = useMemo(() => {
    const parametros = new URLSearchParams()
    for (const nome of ['especie', 'sexo', 'idade', 'porte', 'cidade', 'uf']) {
      if (busca.get(nome)) parametros.set(nome, busca.get(nome))
    }
    return parametros.toString()
  }, [busca])

  const quantidadeFiltros = useMemo(
    () => GRUPOS.reduce((total, [nome]) => total + lerLista(busca, nome).length, 0) + (busca.get('cidade') ? 1 : 0),
    [busca],
  )

  const carregar = useCallback(() => {
    setEstado('carregando')
    api(`/api/animais/?${consulta}`)
      .then((dados) => {
        setPagina(dados)
        setEstado('pronto')
      })
      .catch(() => setEstado('erro'))
  }, [consulta])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    api('/api/animais/cidades/').then(setCidades).catch(() => setCidades([]))
  }, [])

  const mudarFiltros = (mudancas) => {
    const nova = new URLSearchParams(busca)
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor) nova.set(chave, valor)
      else nova.delete(chave)
    }
    setBusca(nova, { replace: true })
  }

  const limpar = () => setBusca(new URLSearchParams(), { replace: true })

  const carregarMais = async () => {
    setCarregandoMais(true)
    try {
      const caminho = new URL(pagina.next, window.location.origin)
      const dados = await api(caminho.pathname + caminho.search)
      setPagina((atual) => ({ ...dados, results: [...atual.results, ...dados.results] }))
    } catch {
      setEstado('erro')
    } finally {
      setCarregandoMais(false)
    }
  }

  return (
    <main className="conteudo">
      <div className="titulo-pagina">
        <h1>Animais para adoção</h1>
        <p>Use os filtros para encontrar o animal ideal para você.</p>
      </div>

      <div className="animais-layout">
        <aside className="cartao filtros-lateral" aria-label="Filtros">
          <div className="filtros-topo">
            <h3>Filtros</h3>
            {quantidadeFiltros > 0 && <button type="button" className="link-botao" onClick={limpar}>Limpar</button>}
          </div>
          <Filtros busca={busca} cidades={cidades} aoMudar={mudarFiltros} />
        </aside>

        <section>
          <div className="animais-topo">
            <p>
              {estado === 'pronto' && <><strong>{plural(pagina.count, 'animal', 'animais')}</strong> {pagina.count === 1 ? 'encontrado' : 'encontrados'}</>}
            </p>
            <button type="button" className="botao botao-neutro abrir-filtros" onClick={() => setPainelAberto(true)}>
              <Filtro /> Filtros{quantidadeFiltros > 0 && ` (${quantidadeFiltros})`}
            </button>
          </div>

          {estado === 'carregando' && <Carregando texto="Procurando animais…" />}
          {estado === 'erro' && (
            <Aviso tipo="erro" acao={<button type="button" className="link-botao" onClick={carregar}>Tentar de novo</button>}>
              Não foi possível carregar os animais. Confira sua conexão.
            </Aviso>
          )}
          {estado === 'pronto' && pagina.count === 0 && (
            <div className="cartao vazio">
              <h3>Nenhum animal encontrado</h3>
              <p>{quantidadeFiltros > 0 ? 'Tente tirar algum filtro ou escolher outra cidade.' : 'Ainda não há animais disponíveis. Volte em breve!'}</p>
              {quantidadeFiltros > 0 && <button type="button" className="botao botao-primario" onClick={limpar}>Limpar filtros</button>}
            </div>
          )}
          {estado === 'pronto' && pagina.count > 0 && (
            <>
              <div className="grade grade-animais">
                {pagina.results.map((animal) => (
                  <CartaoAnimal key={animal.id} animal={animal} para={`/animais/${animal.id}`} />
                ))}
              </div>
              {pagina.next && (
                <div className="carregar-mais">
                  <button type="button" className="botao botao-neutro" onClick={carregarMais} disabled={carregandoMais}>
                    {carregandoMais ? 'Carregando…' : 'Ver mais animais'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {painelAberto && (
        <div className="fundo-modal painel-fundo" onClick={() => setPainelAberto(false)}>
          <div className="painel-filtros" role="dialog" aria-modal="true" aria-label="Filtros" onClick={(e) => e.stopPropagation()}>
            <div className="filtros-topo">
              <h3>Filtros</h3>
              <button type="button" className="botao botao-texto" onClick={() => setPainelAberto(false)} aria-label="Fechar filtros">
                <Fechar />
              </button>
            </div>
            <Filtros busca={busca} cidades={cidades} aoMudar={mudarFiltros} />
            <div className="painel-acoes">
              <button type="button" className="botao botao-neutro" onClick={limpar}>Limpar</button>
              <button type="button" className="botao botao-primario" onClick={() => setPainelAberto(false)}>
                {estado === 'pronto' ? `Ver ${plural(pagina.count, 'animal', 'animais')}` : 'Ver animais'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
