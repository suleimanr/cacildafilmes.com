import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET(req: Request) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY não configurada",
      })
    }

    // Obter parâmetros da URL
    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get("threadId")
    const runId = searchParams.get("runId")

    if (!threadId || !runId) {
      return NextResponse.json({
        success: false,
        error: "Parâmetros threadId e runId são obrigatórios",
      })
    }

    // Criar instância da OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Verificar status do run
    try {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId)

      // Se o run estiver completo, buscar as mensagens
      let messages = null
      if (run.status === "completed") {
        const threadMessages = await openai.beta.threads.messages.list(threadId)
        messages = threadMessages.data.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content.map((c) => (c.type === "text" ? c.text.value : null)).filter(Boolean),
        }))
      }

      return NextResponse.json({
        success: true,
        run: {
          id: run.id,
          status: run.status,
          started_at: run.started_at,
          completed_at: run.completed_at,
        },
        messages: messages,
      })
    } catch (error) {
      console.error("Erro ao verificar status do run:", error)
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
