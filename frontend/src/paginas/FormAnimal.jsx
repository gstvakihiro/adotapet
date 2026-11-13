import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api } from '../api.js'
import { Aviso, Carregando } from '../componentes/Comuns.jsx'
import { Camera, Seta } from '../componentes/Icones.jsx'
import { ESPECIES, PORTES, SEXOS, UFS } from '../formato.js'
import './FormAnimal.css'

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAXIMO = 12 * 1024 * 1024
const CAMPOS = ['nome', 'especie', 'sexo', 'idade', 'porte', 'cidade', 'uf', 'descricao']

function Escolha({ nome, titulo, opcoes, valor, erro, aoMudar }) {
  return (
    <fieldset className="campo escolha" data-erro={Boolean(erro)}>
      <legend className="rotulo">{titulo}</legend>
      <div className="escolha-opcoes">
        {opcoes.map(([chave, texto]) => (
          <label key={chave} className="escolha-opcao" data-marcado={valor === chave}>
            <input type="radio" name={nome} value={chave} checked={valor === chave} onChange={() => aoMudar(chave)} />
            {texto}
          </label>
        ))}
      </div>
      {erro && <p className="erro-campo">{erro}</p>}
    </fieldset>
  )
}

function validar(dados, foto, editando) {
  const erros = {}
  if (!dados.nome.trim()) erros.nome = 'Informe o nome do animal.'
  if (!dados.especie) erros.especie = 'Escolha a espécie.'
  if (!dados.sexo) erros.sexo = 'Escolha o sexo.'
  if (!dados.porte) erros.porte = 'Escolha o porte.'
  if (!/^\d{1,2}$/.test(dados.idade) || Number(dados.idade) > 30) {
    erros.idade = 'Informe a idade em anos, só com números, até 30. Use 0 para menos de 1 ano.'
  }
  if (!dados.cidade.trim()) erros.cidade = 'Informe a cidade.'
  if (!dados.uf) erros.uf = 'Escolha a UF.'
  if (!foto && !editando) erros.foto = 'Escolha uma foto do animal.'
  return erros
}

export default function FormAnimal() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navegar = useNavigate()
  const entradaFoto = useRef(null)
  const [dados, setDados] = useState({ nome: '', especie: '', sexo: '', idade: '', porte: '', cidade: '', uf: 'SP', descricao: '' })
  const [fotoAtual, setFotoAtual] = useState(null)
  const [foto, setFoto] = useState(null)
  const [previa, setPrevia] = useState(null)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [estado, setEstado] = useState(editando ? 'carregando' : 'pronto')
  const [enviando, setEnviando] = useState(false)
  const [arrastando, setArrastando] = useState(false)

  useEffect(() => {
    if (!editando) return
    api(`/api/meus-animais/${id}/`)
      .then((animal) => {
        setDados(Object.fromEntries(CAMPOS.map((c) => [c, String(animal[c] ?? '')])))
        setFotoAtual(animal.foto)
        setEstado('pronto')
      })
      .catch(() => setEstado('erro'))
  }, [editando, id])

  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa])

  const mudar = (campo) => (valor) => setDados((atual) => ({ ...atual, [campo]: valor }))

  const escolherFoto = (arquivo) => {
    if (!arquivo) return
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErros((e) => ({ ...e, foto: 'Este formato não é aceito. Envie a foto em JPG, PNG ou WebP.' }))
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErros((e) => ({ ...e, foto: 'A foto passa de 12 MB. Escolha uma foto menor.' }))
      return
    }
    setErros((e) => ({ ...e, foto: undefined }))
    setFoto(arquivo)
    setPrevia(URL.createObjectURL(arquivo))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    setErroGeral('')
    const novos = validar(dados, foto, editando)
    setErros(novos)
    if (Object.keys(novos).length) {
      setErroGeral('Confira os campos destacados.')
      return
    }
    const formulario = new FormData()
    CAMPOS.forEach((campo) => formulario.append(campo, dados[campo].trim()))
    if (foto) formulario.append('foto', foto)
    setEnviando(true)
    try {
      const animal = await api(editando ? `/api/meus-animais/${id}/` : '/api/meus-animais/', {
        metodo: editando ? 'PATCH' : 'POST',
        dados: formulario,
      })
      navegar('/meus-animais', {
        state: { mensagem: editando ? `As alterações de ${animal.nome} foram salvas.` : `${animal.nome} foi cadastrado e já aparece na busca.` },
      })
    } catch (erro) {
      if (erro.status === 400) {
        setErros(Object.fromEntries([...CAMPOS, 'foto'].map((c) => [c, erro.mensagem(c)])))
        setErroGeral('Confira os campos destacados.')
      } else {
        setErroGeral('Não foi possível enviar. Confira sua conexão e tente de novo.')
      }
      setEnviando(false)
    }
  }

  if (estado === 'carregando') return <main className="conteudo"><Carregando /></main>
  if (estado === 'erro') {
    return (
      <main className="conteudo">
        <div className="cartao vazio">
          <h2>Animal não encontrado</h2>
          <Link to="/meus-animais" className="botao botao-primario">Voltar para Meus animais</Link>
        </div>
      </main>
    )
  }

  const imagem = previa || fotoAtual

  return (
    <main className="conteudo conteudo-formulario">
      <Link to="/meus-animais" className="voltar"><Seta tamanho={18} /> Meus animais</Link>
      <div className="titulo-pagina">
        <h1>{editando ? `Editar ${dados.nome || 'animal'}` : 'Cadastrar animal'}</h1>
        <p>{editando ? 'Altere o que precisar e salve.' : 'Com uma foto e alguns dados, ele já aparece para quem quer adotar.'}</p>
      </div>
      {erroGeral && <Aviso tipo="erro">{erroGeral}</Aviso>}

      <form className="cartao formulario form-animal" onSubmit={enviar} noValidate>
        <div className="campo" data-erro={Boolean(erros.foto)}>
          <span className="rotulo">Foto</span>
          <div
            className={`area-foto${arrastando ? ' arrastando' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setArrastando(true)
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault()
              setArrastando(false)
              escolherFoto(e.dataTransfer.files[0])
            }}
          >
            {imagem ? (
              <img src={imagem} alt="Prévia da foto do animal" />
            ) : (
              <div className="area-foto-vazia">
                <Camera tamanho={32} />
                <p><strong>Tire uma foto ou escolha da galeria</strong></p>
                <p className="ajuda">No computador, você também pode arrastar a foto para cá.</p>
              </div>
            )}
          </div>
          <input
            ref={entradaFoto}
            id="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => escolherFoto(e.target.files[0])}
          />
          <button type="button" className="botao botao-neutro" onClick={() => entradaFoto.current?.click()}>
            <Camera tamanho={18} /> {imagem ? 'Trocar foto' : 'Escolher foto'}
          </button>
          {erros.foto ? <p className="erro-campo">{erros.foto}</p> : <p className="ajuda">JPG, PNG ou WebP, até 12 MB.</p>}
        </div>

        <div className="campo" data-erro={Boolean(erros.nome)}>
          <label htmlFor="nome">Nome</label>
          <input id="nome" maxLength={100} value={dados.nome} onChange={(e) => mudar('nome')(e.target.value)} />
          {erros.nome && <p className="erro-campo">{erros.nome}</p>}
        </div>

        <Escolha nome="especie" titulo="Espécie" opcoes={ESPECIES} valor={dados.especie} erro={erros.especie} aoMudar={mudar('especie')} />
        <Escolha nome="sexo" titulo="Sexo" opcoes={SEXOS} valor={dados.sexo} erro={erros.sexo} aoMudar={mudar('sexo')} />

        <div className="formulario-duas">
          <div className="campo" data-erro={Boolean(erros.idade)}>
            <label htmlFor="idade">Idade (anos)</label>
            <input id="idade" inputMode="numeric" maxLength={2} value={dados.idade} onChange={(e) => mudar('idade')(e.target.value.trim())} />
            {erros.idade ? <p className="erro-campo">{erros.idade}</p> : <p className="ajuda">Use 0 para menos de 1 ano.</p>}
          </div>
          <Escolha nome="porte" titulo="Porte" opcoes={PORTES} valor={dados.porte} erro={erros.porte} aoMudar={mudar('porte')} />
        </div>

        <div className="formulario-cidade">
          <div className="campo" data-erro={Boolean(erros.cidade)}>
            <label htmlFor="cidade">Cidade</label>
            <input id="cidade" maxLength={100} placeholder="Ex.: Votuporanga" value={dados.cidade} onChange={(e) => mudar('cidade')(e.target.value)} />
            {erros.cidade && <p className="erro-campo">{erros.cidade}</p>}
          </div>
          <div className="campo" data-erro={Boolean(erros.uf)}>
            <label htmlFor="uf">UF</label>
            <select id="uf" value={dados.uf} onChange={(e) => mudar('uf')(e.target.value)}>
              {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
            {erros.uf && <p className="erro-campo">{erros.uf}</p>}
          </div>
        </div>

        <div className="campo">
          <label htmlFor="descricao">Descrição (opcional)</label>
          <textarea id="descricao" placeholder="Temperamento, saúde, vacinas e cuidados." value={dados.descricao} onChange={(e) => mudar('descricao')(e.target.value)} />
        </div>

        <div className="form-acoes">
          <Link to="/meus-animais" className="botao botao-neutro">Cancelar</Link>
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            {enviando ? 'Enviando…' : editando ? 'Salvar alterações' : 'Cadastrar animal'}
          </button>
        </div>
      </form>
    </main>
  )
}
