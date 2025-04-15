// Configurações para integrações externas

// Função para verificar se as configurações do OpenAI estão presentes
export function checkOpenAIConfig() {
  const isConfigured = !!process.env.OPENAI_API_KEY && !!process.env.OPENAI_ASSISTANT_ID

  const missingVariables = []
  if (!process.env.OPENAI_API_KEY) missingVariables.push("OPENAI_API_KEY")
  if (!process.env.OPENAI_ASSISTANT_ID) missingVariables.push("OPENAI_ASSISTANT_ID")

  return {
    isConfigured,
    missingVariables,
  }
}
