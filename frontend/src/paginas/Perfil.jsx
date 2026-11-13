import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { Aviso } from '../componentes/Comuns.jsx'
import { iniciais } from '../formato.js'

export default function Perfil() {
  const { usuario, recarregar } = useAuth()
  const [dados, setDados] = useState({ nome: usuario.nome, telefone: usuario.telefone })
  const [erros, setErros] = useState({})
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const responsavel = usuario.tipo === 'responsavel'

  const enviar = async (evento) => {
    evento.preventDefault()
    setEnviando(true)
    setAviso(null)
    setErros({})
    try {
      await api('/api/auth/me/', { metodo: 'PATCH', dados })
      await recarregar()
      setAviso({ tipo: 'sucesso', texto: 'Seus dados foram salvos.' })
    } catch (erro) {
      if (erro.status === 400) setErros({ nome: erro.mensagem('nome'), telefone: erro.mensagem('telefone') })
      else setAviso({ tipo: 'erro', texto: 'Não foi possível salvar. Confira sua conexão e tente de novo.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="conteudo conteudo-formulario">
      <div className="titulo-pagina">
        <h1>Meu perfil</h1>
        <p>{responsavel ? 'Seu nome e telefone aparecem para quem tiver a solicitação aceita.' : 'Seu nome aparece para o responsável; o contato, só depois que ele aceita.'}</p>
      </div>
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <form className="cartao formulario form-animal" onSubmit={enviar} noValidate>
        <div className="perfil-topo">
          <span className={`avatar${responsavel ? ' avatar-responsavel' : ''}`}>{iniciais(usuario.nome)}</span>
          <div>
            <strong>{usuario.email}</strong>
            <p className="secundario">{responsavel ? 'Conta de responsável' : 'Conta de adotante'}</p>
          </div>
        </div>
        <div className="campo" data-erro={Boolean(erros.nome)}>
          <label htmlFor="nome">{responsavel ? 'Nome da pessoa ou ONG' : 'Nome'}</label>
          <input id="nome" maxLength={150} value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} />
          {erros.nome && <p className="erro-campo">{erros.nome}</p>}
        </div>
        <div className="campo" data-erro={Boolean(erros.telefone)}>
          <label htmlFor="telefone">Telefone (opcional)</label>
          <input id="telefone" type="tel" inputMode="tel" maxLength={20} placeholder="(17) 99999-0000" value={dados.telefone} onChange={(e) => setDados({ ...dados, telefone: e.target.value })} />
          {erros.telefone ? <p className="erro-campo">{erros.telefone}</p> : <p className="ajuda">Com DDD, por exemplo (17) 99999-0000.</p>}
        </div>
        <div className="form-acoes">
          <Link to={responsavel ? '/meus-animais' : '/animais'} className="botao botao-neutro">Voltar</Link>
          <button type="submit" className="botao botao-primario" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </main>
  )
}
