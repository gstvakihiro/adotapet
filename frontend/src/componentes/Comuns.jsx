import { useEffect, useRef } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../auth.jsx'
import { STATUS_SOLICITACAO, cidadeUf, idadeTexto, rotulo } from '../formato.js'
import { Check, Pata } from './Icones.jsx'

export function Aviso({ tipo = 'sucesso', children, acao }) {
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {tipo === 'sucesso' && <Check />}
      <span>{children}</span>
      {acao && <span className="aviso-acao">{acao}</span>}
    </div>
  )
}

export function Carregando({ texto = 'Carregando…' }) {
  return <p className="carregando" role="status">{texto}</p>
}

export function FotoAnimal({ animal, selo, grande }) {
  return (
    <div className={`foto-animal${grande ? ' foto-grande' : ''}`}>
      {animal.foto ? (
        <img src={animal.foto} alt={`Foto de ${animal.nome}`} loading="lazy" />
      ) : (
        <span className="foto-vazia"><Pata /> Sem foto</span>
      )}
      {selo}
    </div>
  )
}

export function SeloStatusAnimal({ status }) {
  return status === 'adotado' ? <span className="selo selo-adotado">Adotado</span> : <span className="selo selo-disponivel">Disponível</span>
}

export function SeloSolicitacao({ status }) {
  const info = STATUS_SOLICITACAO[status]
  return (
    <span className={`selo selo-${status}`}>
      <span aria-hidden="true">{info.icone}</span> {info.rotulo}
    </span>
  )
}

export function Caracteristicas({ animal, umaLinha }) {
  if (umaLinha) {
    return (
      <p className="secundario uma-linha">
        {rotulo(animal.especie)} · {rotulo(animal.sexo)} · {idadeTexto(animal.idade)} · {rotulo(animal.porte)}
      </p>
    )
  }
  return (
    <>
      <p className="secundario uma-linha">{rotulo(animal.especie)} · {rotulo(animal.sexo)}</p>
      <p className="secundario uma-linha">{idadeTexto(animal.idade)} · {rotulo(animal.porte)}</p>
    </>
  )
}

export function CartaoAnimal({ animal, para }) {
  return (
    <Link to={para} className="cartao cartao-animal">
      <FotoAnimal animal={animal} />
      <div className="cartao-animal-corpo">
        <h3 className="uma-linha">{animal.nome}</h3>
        <Caracteristicas animal={animal} />
        <p className="secundario uma-linha">{cidadeUf(animal)}</p>
      </div>
    </Link>
  )
}

export function Protegida({ tipo, children }) {
  const { usuario } = useAuth()
  const local = useLocation()
  if (usuario === undefined) return <Carregando />
  if (usuario === null) {
    return <Navigate to={`/entrar?proximo=${encodeURIComponent(local.pathname + local.search)}`} replace />
  }
  if (tipo && usuario.tipo !== tipo) {
    return (
      <main className="conteudo">
        <div className="cartao vazio">
          <h2>Esta página é só para {tipo === 'responsavel' ? 'responsáveis' : 'adotantes'}</h2>
          <p>Você entrou com uma conta de {usuario.tipo === 'responsavel' ? 'responsável' : 'adotante'}.</p>
          <Link to="/" className="botao botao-primario">Ir para o início</Link>
        </div>
      </main>
    )
  }
  return children
}

export function Confirmar({ titulo, children, rotuloConfirmar, aoConfirmar, aoCancelar }) {
  const cancelarRef = useRef(null)
  useEffect(() => {
    cancelarRef.current?.focus()
    const tecla = (evento) => evento.key === 'Escape' && aoCancelar()
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [aoCancelar])
  return (
    <div className="fundo-modal" onClick={aoCancelar}>
      <div className="cartao modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal" onClick={(e) => e.stopPropagation()}>
        <h3 id="titulo-modal">{titulo}</h3>
        <div className="secundario">{children}</div>
        <div className="modal-acoes">
          <button type="button" className="botao botao-neutro" ref={cancelarRef} onClick={aoCancelar}>Cancelar</button>
          <button type="button" className="botao botao-primario" onClick={aoConfirmar}>{rotuloConfirmar}</button>
        </div>
      </div>
    </div>
  )
}

export function AlternarStatus({ status, ocupado, aoMudar }) {
  return (
    <div className="alternar" role="group" aria-label="Status do animal">
      {[
        ['disponivel', 'Disponível'],
        ['adotado', 'Adotado'],
      ].map(([valor, texto]) => (
        <button
          key={valor}
          type="button"
          data-valor={valor}
          aria-pressed={status === valor}
          disabled={ocupado}
          onClick={() => status !== valor && aoMudar(valor)}
        >
          {status === valor && <Check tamanho={16} />} {texto}
        </button>
      ))}
    </div>
  )
}

export function Pilulas({ opcoes, valor, aoMudar, rotulo: rotuloGrupo }) {
  return (
    <div className="pilulas" role="group" aria-label={rotuloGrupo}>
      {opcoes.map(([chave, texto, contagem]) => (
        <button key={chave} type="button" className="pilula" aria-pressed={valor === chave} onClick={() => aoMudar(chave)}>
          {texto} {contagem !== undefined && <small>{contagem}</small>}
        </button>
      ))}
    </div>
  )
}
