// Endereço da API. Vem do arquivo .env (VITE_API_URL); se não existir,
// usa o backend rodando localmente na porta 8000.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Fase 5: aqui entra o cliente HTTP que envia o token JWT em cada chamada.
export async function getHealth() {
  const resposta = await fetch(`${API_URL}/api/health/`)
  if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`)
  return resposta.json()
}
