import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../auth.jsx'
import { Aviso } from '../componentes/Comuns.jsx'
import { Pata } from '../componentes/Icones.jsx'
import './Acesso.css'

function destinoDepois(usuario, proximo) {
  if (proximo && proximo.startsWith('/') && !proximo.startsWith('//')) return proximo
  return usuario?.tipo === 'responsavel' ? '/meus-animais' : '/animais'
}

function Moldura({ titulo, subtitulo, children }) {
  return (
    <main className="acesso">
      <div className="acesso-lado" aria-hidden="true">
        <Pata tamanho={96} />
        <p>Cada adoção começa com um primeiro contato.</p>
      </div>
      <div className="acesso-formulario">
        <div className="titulo-pagina">
          <h2>{titulo}</h2>
          <p>{subtitulo}</p>
        </div>
        {children}
      </div>
    </main>
  )
}

function Campo({ id, rotulo, erro, ajuda, children }) {
  return (
    <div className="campo" data-erro={Boolean(erro)}>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {erro ? <p className="erro-campo" id={`${id}-erro`}>{erro}</p> : ajuda && <p className="ajuda">{ajuda}</p>}
    </div>
  )
}

export function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const [busca] = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const usuario = await entrar(email, senha)
      navegar(destinoDepois(usuario, busca.get('proximo')), { replace: true })
    } catch (falha) {
      setErro(falha.status === 401 ? 'Email ou senha incorretos.' : falha.status === 400 ? 'Preencha o email e a senha.' : 'Não foi possível entrar. Confira sua conexão e tente de novo.')
      setEnviando(false)
    }
  }

  return (
    <Moldura titulo="Entrar" subtitulo="Acesse sua conta para continuar.">
      {busca.get('proximo') && !erro && <Aviso tipo="alerta">Entre na sua conta para continuar.</Aviso>}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo id="email" rotulo="Email">
          <input id="email" type="email" autoComplete="email" inputMode="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Campo>
        <Campo id="senha" rotulo="Senha">
          <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </Campo>
        <button type="submit" className="botao botao-primario botao-largo botao-grande" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="acesso-troca">
        Ainda não tem conta? <Link to={`/criar-conta${busca.get('proximo') ? `?proximo=${encodeURIComponent(busca.get('proximo'))}` : ''}`}>Criar conta</Link>
      </p>
    </Moldura>
  )
}

export function Cadastro() {
  const { cadastrar } = useAuth()
  const navegar = useNavigate()
  const [busca] = useSearchParams()
  const [dados, setDados] = useState({
    tipo: busca.get('tipo') === 'responsavel' ? 'responsavel' : 'adotante',
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmar: '',
  })
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const responsavel = dados.tipo === 'responsavel'

  const mudar = (campo) => (evento) => setDados((atual) => ({ ...atual, [campo]: evento.target.value }))

  const enviar = async (evento) => {
    evento.preventDefault()
    setErroGeral('')
    const novos = {}
    if (dados.senha.length < 8) novos.senha = 'A senha precisa ter pelo menos 8 caracteres.'
    if (dados.confirmar !== dados.senha) novos.confirmar = 'As senhas não são iguais.'
    if (!dados.nome.trim()) novos.nome = 'Informe o seu nome.'
    if (!dados.email.trim()) novos.email = 'Informe o seu email.'
    setErros(novos)
    if (Object.keys(novos).length) return
    setEnviando(true)
    try {
      const { tipo, nome, email, telefone, senha } = dados
      const usuario = await cadastrar({ tipo, nome, email, telefone, senha })
      navegar(destinoDepois(usuario, busca.get('proximo')), { replace: true, state: { boasVindas: true } })
    } catch (falha) {
      if (falha.status === 400) {
        setErros(Object.fromEntries(['nome', 'email', 'telefone', 'senha', 'tipo'].map((c) => [c, falha.mensagem(c)])))
        setErroGeral('Confira os campos destacados.')
      } else {
        setErroGeral('Não foi possível criar a conta. Confira sua conexão e tente de novo.')
      }
      setEnviando(false)
    }
  }

  return (
    <Moldura titulo="Criar conta" subtitulo="Leva menos de um minuto.">
      {erroGeral && <Aviso tipo="erro">{erroGeral}</Aviso>}
      <form className="formulario" onSubmit={enviar} noValidate>
        <fieldset className="tipo-conta">
          <legend className="rotulo">Como você vai usar o AdotaPet?</legend>
          {[
            ['adotante', 'Quero adotar', 'Procuro um animal para adotar.'],
            ['responsavel', 'Sou responsável', 'Tenho animais para adoção (pessoa ou ONG).'],
          ].map(([valor, titulo, texto]) => (
            <label key={valor} className="tipo-opcao" data-marcado={dados.tipo === valor}>
              <input type="radio" name="tipo" value={valor} checked={dados.tipo === valor} onChange={mudar('tipo')} />
              <span>
                <strong>{titulo}</strong>
                <span className="secundario">{texto}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <Campo id="nome" rotulo={responsavel ? 'Nome da pessoa ou ONG' : 'Nome'} erro={erros.nome}>
          <input id="nome" autoComplete="name" maxLength={150} value={dados.nome} onChange={mudar('nome')} />
        </Campo>
        <Campo id="email" rotulo="Email" erro={erros.email}>
          <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" value={dados.email} onChange={mudar('email')} />
        </Campo>
        <Campo id="telefone" rotulo="Telefone (opcional)" erro={erros.telefone} ajuda={responsavel ? 'Ajuda os interessados a falarem com você.' : 'Com DDD, por exemplo (17) 99999-0000.'}>
          <input id="telefone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(17) 99999-0000" maxLength={20} value={dados.telefone} onChange={mudar('telefone')} />
        </Campo>
        <Campo id="senha" rotulo="Senha" erro={erros.senha} ajuda="Mínimo de 8 caracteres.">
          <input id="senha" type="password" autoComplete="new-password" maxLength={128} value={dados.senha} onChange={mudar('senha')} />
        </Campo>
        <Campo id="confirmar" rotulo="Confirmar senha" erro={erros.confirmar}>
          <input id="confirmar" type="password" autoComplete="new-password" maxLength={128} value={dados.confirmar} onChange={mudar('confirmar')} />
        </Campo>
        <button type="submit" className="botao botao-primario botao-largo botao-grande" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
      <p className="acesso-troca">
        Já tem conta? <Link to={`/entrar${busca.get('proximo') ? `?proximo=${encodeURIComponent(busca.get('proximo'))}` : ''}`}>Entrar</Link>
      </p>
    </Moldura>
  )
}
