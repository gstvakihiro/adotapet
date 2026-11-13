import { Link, Route, Routes } from 'react-router'
import Cabecalho from './componentes/Cabecalho.jsx'
import { Protegida } from './componentes/Comuns.jsx'
import { Cadastro, Login } from './paginas/Acesso.jsx'
import Animais from './paginas/Animais.jsx'
import DetalheAnimal from './paginas/DetalheAnimal.jsx'
import FormAnimal from './paginas/FormAnimal.jsx'
import Inicio from './paginas/Inicio.jsx'
import Interessados from './paginas/Interessados.jsx'
import MeusAnimais from './paginas/MeusAnimais.jsx'
import MinhasSolicitacoes from './paginas/MinhasSolicitacoes.jsx'
import Perfil from './paginas/Perfil.jsx'

function NaoEncontrada() {
  return (
    <main className="conteudo">
      <div className="cartao vazio">
        <h2>Página não encontrada</h2>
        <p>O endereço pode estar errado.</p>
        <Link to="/" className="botao botao-primario">Ir para o início</Link>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <>
      <a href="#principal" className="pular">Pular para o conteúdo</a>
      <Cabecalho />
      <div id="principal">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/criar-conta" element={<Cadastro />} />
          <Route path="/animais" element={<Animais />} />
          <Route path="/animais/:id" element={<DetalheAnimal />} />
          <Route path="/minhas-solicitacoes" element={<Protegida tipo="adotante"><MinhasSolicitacoes /></Protegida>} />
          <Route path="/meus-animais" element={<Protegida tipo="responsavel"><MeusAnimais /></Protegida>} />
          <Route path="/meus-animais/novo" element={<Protegida tipo="responsavel"><FormAnimal /></Protegida>} />
          <Route path="/meus-animais/:id/editar" element={<Protegida tipo="responsavel"><FormAnimal /></Protegida>} />
          <Route path="/meus-animais/:id/interessados" element={<Protegida tipo="responsavel"><Interessados /></Protegida>} />
          <Route path="/perfil" element={<Protegida><Perfil /></Protegida>} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </div>
    </>
  )
}
