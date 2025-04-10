// !!!ATENÇÃO!!!
// Este arquivo contém configurações críticas para o ElevenLabs.
// NÃO MODIFIQUE este arquivo sem um pedido explícito e aprovação.
// Alterações aqui podem afetar o funcionamento do agente ElevenLabs.

export const ELEVENLABS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
  apiBaseUrl: "https://api.elevenlabs.io/v1" as const,
  wsBaseUrl: "wss://api.elevenlabs.io/v1/convai/conversation" as const,
}

export const config = {
  elevenlabs: ELEVENLABS_CONFIG,
}

// Verificar se as variáveis de ambiente estão configuradas
export function checkOpenAIConfig() {
  const hasApiKey = !!process.env.OPENAI_API_KEY
  const hasAssistantId = !!process.env.OPENAI_ASSISTANT_ID

  return {
    isConfigured: hasApiKey && hasAssistantId,
    missingVariables: {
      apiKey: !hasApiKey,
      assistantId: !hasAssistantId,
    },
  }
}
