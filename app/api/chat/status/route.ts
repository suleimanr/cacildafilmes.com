import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(req: Request) {
  try {
    console.log("Iniciando /api/chat/status")

    // Verificar variáveis de ambiente
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada")
      return NextResponse.json({ error: "Configuração da API OpenAI ausente." }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get("threadId")
    const runId = searchParams.get("runId")

    console.log("Parâmetros recebidos:", { threadId, runId })

    if (!threadId || !runId) {
      console.error("Parâmetros ausentes")
      return NextResponse.json({ error: "threadId e runId são obrigatórios." }, { status: 400 })
    }

    try {
      console.log("Verificando status do run")
      const run = await openai.beta.threads.runs.retrieve(threadId, runId)
      console.log("Status obtido:", run.status)

      // Log detalhado para depuração
      console.log("Detalhes do run:", {
        id: run.id,
        status: run.status,
        started_at: run.started_at,
        completed_at: run.completed_at,
        assistant_id: run.assistant_id,
        has_error: !!run.last_error,
      })

      // Se houver erro, registrar detalhes
      if (run.last_error) {
        console.error("Erro no run:", run.last_error)
      }

      return NextResponse.json({
        status: run.status,
        details: {
          started_at: run.started_at,
          completed_at: run.completed_at,
          has_error: !!run.last_error,
          error_code: run.last_error?.code,
          error_message: run.last_error?.message,
        },
      })
    } catch (err) {
      console.error("Erro ao verificar status:", err)
      return NextResponse.json({ error: "Erro ao consultar status." }, { status: 500 })
    }
  } catch (err) {
    console.error("[status] Erro geral:", err)
    return NextResponse.json({ error: "Erro ao consultar status." }, { status: 500 })
  }
}
