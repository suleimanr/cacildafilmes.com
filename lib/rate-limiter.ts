// Utilitário para gerenciar limitação de taxa (rate limiting)

// Armazenar o timestamp da última solicitação para cada endpoint
const lastRequestTime: Record<string, number> = {}

// Armazenar o tempo de espera atual para cada endpoint
const currentBackoff: Record<string, number> = {}

// Configurações de backoff
const MIN_BACKOFF_MS = 1000 // 1 segundo
const MAX_BACKOFF_MS = 60000 // 1 minuto
const BACKOFF_FACTOR = 2 // Fator de multiplicação para backoff exponencial
const DEFAULT_COOLDOWN_MS = 2000 // 2 segundos entre solicitações normais

/**
 * Verifica se podemos fazer uma solicitação para um endpoint específico
 * @param endpoint Identificador único para o endpoint
 * @returns {boolean} True se podemos fazer a solicitação, False caso contrário
 */
export function canMakeRequest(endpoint: string): boolean {
  const now = Date.now()
  const last = lastRequestTime[endpoint] || 0
  const backoff = currentBackoff[endpoint] || 0

  // Verificar se passou tempo suficiente desde a última solicitação
  return now - last >= (backoff || DEFAULT_COOLDOWN_MS)
}

/**
 * Registra uma solicitação bem-sucedida para um endpoint
 * @param endpoint Identificador único para o endpoint
 */
export function recordSuccessfulRequest(endpoint: string): void {
  lastRequestTime[endpoint] = Date.now()
  // Resetar o backoff após uma solicitação bem-sucedida
  currentBackoff[endpoint] = 0
}

/**
 * Registra uma solicitação com erro para um endpoint e aumenta o backoff
 * @param endpoint Identificador único para o endpoint
 * @param statusCode Código de status HTTP da resposta
 * @returns {number} Tempo de espera em ms antes da próxima tentativa
 */
export function recordFailedRequest(endpoint: string, statusCode: number): number {
  lastRequestTime[endpoint] = Date.now()

  // Aumentar o backoff apenas para erros de limite de taxa (429)
  if (statusCode === 429) {
    // Inicializar ou aumentar o backoff
    currentBackoff[endpoint] = Math.min((currentBackoff[endpoint] || MIN_BACKOFF_MS) * BACKOFF_FACTOR, MAX_BACKOFF_MS)
  }

  return currentBackoff[endpoint] || DEFAULT_COOLDOWN_MS
}

/**
 * Obtém o tempo estimado de espera antes da próxima solicitação permitida
 * @param endpoint Identificador único para o endpoint
 * @returns {number} Tempo de espera em ms
 */
export function getWaitTime(endpoint: string): number {
  const now = Date.now()
  const last = lastRequestTime[endpoint] || 0
  const backoff = currentBackoff[endpoint] || DEFAULT_COOLDOWN_MS

  const elapsed = now - last
  return Math.max(0, backoff - elapsed)
}
