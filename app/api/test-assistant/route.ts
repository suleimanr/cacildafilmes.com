import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY não configurada",
      })
    }

    if (!process.env.OPENAI_ASSISTANT_ID) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_ASSISTANT_ID não configurado",
      })
    }

    // Criar instância da OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Verificar se o assistente existe
    try {
      const assistant = await openai.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT_ID)

      // Criar uma thread de teste
      const thread = await openai.beta.threads.create()

      // Adicionar uma mensagem de teste
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Olá, este é um teste do assistente.",
      })

      // Executar o assistente
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID,
      })

      return NextResponse.json({
        success: true,
        message: "Assistente encontrado e thread de teste criada com sucesso",
        assistant: {
          id: assistant.id,
          name: assistant.name,
          model: assistant.model,
        },
        thread: {
          id: thread.id,
        },
        run: {
          id: run.id,
          status: run.status,
        },
      })
    } catch (error) {
      console.error("Erro ao testar assistente:", error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  } catch (error) {
    console.error("Erro geral:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
