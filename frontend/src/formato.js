export const ESPECIES = [
  ['cachorro', 'Cachorro'],
  ['gato', 'Gato'],
  ['outro', 'Outro'],
]

export const SEXOS = [
  ['macho', 'Macho'],
  ['femea', 'Fêmea'],
]

export const PORTES = [
  ['pequeno', 'Pequeno'],
  ['medio', 'Médio'],
  ['grande', 'Grande'],
]

export const FAIXAS_IDADE = [
  ['filhote', 'Filhote (menos de 1 ano)'],
  ['jovem', 'Jovem (1 a 3 anos)'],
  ['adulto', 'Adulto (4 a 7 anos)'],
  ['idoso', 'Idoso (8 anos ou mais)'],
]

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const STATUS_SOLICITACAO = {
  pendente: { rotulo: 'Pendente', icone: '●' },
  aceita: { rotulo: 'Aceita', icone: '✓' },
  recusada: { rotulo: 'Recusada', icone: '✕' },
}

const rotulos = Object.fromEntries([...ESPECIES, ...SEXOS, ...PORTES])

export function rotulo(valor) {
  return rotulos[valor] ?? valor
}

export function idadeTexto(idade) {
  if (idade === 0) return 'Menos de 1 ano'
  if (idade === 1) return '1 ano'
  return `${idade} anos`
}

export function cidadeUf(animal) {
  return `${animal.cidade} – ${animal.uf}`
}

export function data(textoIso) {
  return new Date(textoIso).toLocaleDateString('pt-BR')
}

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const letras = partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[partes.length - 1][0]
  return letras.toUpperCase()
}

export function plural(quantidade, singular, pluralTexto) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`
}
