import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { CartaoAnimal } from '../componentes/Comuns.jsx'
import { Pata } from '../componentes/Icones.jsx'
import './Inicio.css'

const PASSOS = [
  ['Encontre', 'Veja os animais disponíveis e use os filtros por espécie, idade, porte e cidade.'],
  ['Demonstre interesse', 'Com um clique, o responsável recebe o seu pedido e responde por aqui.'],
  ['Combine a adoção', 'Quando o pedido é aceito, vocês veem o contato um do outro e combinam os próximos passos.'],
]

export default function Inicio() {
  const { usuario } = useAuth()
  const [animais, setAnimais] = useState([])
  const responsavel = usuario?.tipo === 'responsavel'

  useEffect(() => {
    api('/api/animais/')
      .then((dados) => setAnimais(dados.results.slice(0, 6)))
      .catch(() => setAnimais([]))
  }, [])

  return (
    <main>
      <section className="destaque">
        <div className="destaque-conteudo">
          <span className="selo selo-disponivel"><Pata tamanho={14} /> Adoção responsável</span>
          <h1>Um novo lar começa com um clique</h1>
          <p>O AdotaPet reúne animais para adoção da sua região num só lugar e aproxima quem quer adotar de quem cuida deles.</p>
          <div className="destaque-botoes">
            {responsavel ? (
              <>
                <Link to="/meus-animais" className="botao botao-primario botao-grande">Ver meus animais</Link>
                <Link to="/meus-animais/novo" className="botao botao-secundario botao-grande">Cadastrar animal</Link>
              </>
            ) : (
              <>
                <Link to="/animais" className="botao botao-primario botao-grande">Ver animais para adoção</Link>
                {!usuario && <Link to="/criar-conta?tipo=responsavel" className="botao botao-secundario botao-grande">Sou responsável</Link>}
              </>
            )}
          </div>
        </div>
        <div className="destaque-arte" aria-hidden="true">
          <Pata tamanho={160} />
        </div>
      </section>

      <section className="conteudo como-funciona" id="como-funciona">
        <h2>Como funciona</h2>
        <ol className="passos">
          {PASSOS.map(([titulo, texto], indice) => (
            <li key={titulo} className="cartao passo">
              <span className="passo-numero">{indice + 1}</span>
              <h3>{titulo}</h3>
              <p className="secundario">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {animais.length > 0 && (
        <section className="conteudo recentes">
          <div className="recentes-titulo">
            <h2>Esperando por um lar</h2>
            <Link to="/animais" className="botao botao-texto">Ver todos</Link>
          </div>
          <div className="grade">
            {animais.map((animal) => (
              <CartaoAnimal key={animal.id} animal={animal} para={`/animais/${animal.id}`} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
