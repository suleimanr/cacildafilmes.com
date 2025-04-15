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

// Adicionando a exportação do objeto config que estava faltando
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  storage: {
    videoBucket: "videos",
  },
  // Adicione outras configurações conforme necessário
}
