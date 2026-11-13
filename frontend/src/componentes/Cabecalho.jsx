import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth.jsx'
import { iniciais } from '../formato.js'
import { Abaixo, Fechar, Mais, Menu, Pata } from './Icones.jsx'
import './Cabecalho.css'

function links(usuario) {
  if (!usuario) {
    return [
      ['/', 'Início'],
      ['/animais', 'Animais para adoção'],
    ]
  }
  if (usuario.tipo === 'responsavel') {
    return [
      ['/', 'Início'],
      ['/meus-animais', 'Meus animais'],
      ['/meus-animais?filtro=pendentes', 'Solicitações', usuario.pendentes],
    ]
  }
  return [
    ['/', 'Início'],
    ['/animais', 'Animais para adoção'],
    ['/minhas-solicitacoes', 'Minhas solicitações'],
  ]
}

function ItemMenu({ para, texto, contagem, aoClicar }) {
  const local = useLocation()
  const [caminho, busca = ''] = para.split('?')
  const ativo = caminho === '/' ? local.pathname === '/' : local.pathname === caminho && local.search === (busca ? `?${busca}` : '')
  return (
    <NavLink to={para} className={`menu-link${ativo ? ' ativo' : ''}`} aria-current={ativo ? 'page' : undefined} onClick={aoClicar} end>
      {texto}
      {contagem > 0 && <span className="contador" aria-label={`${contagem} sem resposta`}>{contagem}</span>}
    </NavLink>
  )
}

export default function Cabecalho() {
  const { usuario, sair } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const contaRef = useRef(null)
  const navegar = useNavigate()
  const local = useLocation()

  useEffect(() => {
    setMenuAberto(false)
    setContaAberta(false)
  }, [local.pathname, local.search])

  useEffect(() => {
    if (!contaAberta) return undefined
    const fechar = (evento) => {
      if (!contaRef.current?.contains(evento.target)) setContaAberta(false)
    }
    document.addEventListener('pointerdown', fechar)
    return () => document.removeEventListener('pointerdown', fechar)
  }, [contaAberta])

  const encerrar = () => {
    sair()
    navegar('/')
  }

  const itens = links(usuario)
  const responsavel = usuario?.tipo === 'responsavel'

  return (
    <header className="cabecalho">
      <div className="cabecalho-linha">
        <Link to="/" className="logo" aria-label="AdotaPet, página inicial">
          <Pata className="logo-pata" />
          <span>AdotaPet</span>
        </Link>

        <nav className="menu-computador" aria-label="Principal">
          {itens.map(([para, texto, contagem]) => (
            <ItemMenu key={para} para={para} texto={texto} contagem={contagem} />
          ))}
        </nav>

        <div className="cabecalho-acoes">
          {usuario === null && (
            <>
              <Link to="/entrar" className="botao botao-texto so-computador">Entrar</Link>
              <Link to="/criar-conta" className="botao botao-primario so-computador">Criar conta</Link>
            </>
          )}
          {responsavel && (
            <Link to="/meus-animais/novo" className="botao botao-primario so-computador">
              <Mais /> Cadastrar animal
            </Link>
          )}
          {usuario && (
            <div className="conta so-computador" ref={contaRef}>
              <button type="button" className="conta-botao" aria-expanded={contaAberta} onClick={() => setContaAberta((v) => !v)}>
                <span className={`avatar avatar-pequeno${responsavel ? ' avatar-responsavel' : ''}`}>{iniciais(usuario.nome)}</span>
                <span className="uma-linha conta-nome">{usuario.nome}</span>
                <Abaixo />
              </button>
              {contaAberta && (
                <div className="conta-menu cartao">
                  <p className="conta-email uma-linha">{usuario.email}</p>
                  <Link to="/perfil" className="conta-item">Meu perfil</Link>
                  <button type="button" className="conta-item conta-sair" onClick={encerrar}>Sair</button>
                </div>
              )}
            </div>
          )}
          <button type="button" className="botao botao-texto so-celular" aria-expanded={menuAberto} aria-controls="menu-celular" onClick={() => setMenuAberto((v) => !v)}>
            {menuAberto ? <Fechar /> : <Menu />}
            <span>Menu</span>
            {!menuAberto && usuario?.pendentes > 0 && <span className="contador">{usuario.pendentes}</span>}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav id="menu-celular" className="menu-celular" aria-label="Principal">
          {usuario && (
            <div className="menu-celular-usuario">
              <span className={`avatar${responsavel ? ' avatar-responsavel' : ''}`}>{iniciais(usuario.nome)}</span>
              <div className="uma-linha">
                <strong className="uma-linha">{usuario.nome}</strong>
                <p className="secundario">{responsavel ? 'Responsável' : 'Adotante'}</p>
              </div>
            </div>
          )}
          {itens.map(([para, texto, contagem]) => (
            <ItemMenu key={para} para={para} texto={texto} contagem={contagem} />
          ))}
          {responsavel && (
            <Link to="/meus-animais/novo" className="botao botao-primario botao-largo"><Mais /> Cadastrar animal</Link>
          )}
          {usuario ? (
            <>
              <ItemMenu para="/perfil" texto="Meu perfil" />
              <button type="button" className="menu-link conta-sair" onClick={encerrar}>Sair</button>
            </>
          ) : (
            usuario === null && (
              <div className="menu-celular-botoes">
                <Link to="/entrar" className="botao botao-neutro">Entrar</Link>
                <Link to="/criar-conta" className="botao botao-primario">Criar conta</Link>
              </div>
            )
          )}
        </nav>
      )}
    </header>
  )
}
