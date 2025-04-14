import { NextResponse } from "next/server"
import OpenAI from "openai"
import { generatePortfolioResponse } from "@/lib/portfolio-helper"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export const maxDuration = 60

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0
  while (true) {
    try {
      return await fn()
    } catch (error: any) {
      retries++
      if (retries > maxRetries) throw error
      const delay = initialDelay * Math.pow(2, retries - 1)
      console.log(`Tentativa ${retries} falhou. Tentando novamente em ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_ASSISTANT_ID) {
      return NextResponse.json({ error: "Configuração da OpenAI ausente." }, { status: 500 })
    }

    const { messages, threadId: existingThreadId } = await req.json()

    const lastUserMessage = messages.filter((msg: any) => msg.role === "user").pop()
    if (!lastUserMessage) {
      return NextResponse.json({ error: "Nenhuma mensagem encontrada." }, { status: 400 })
    }

    if (
      lastUserMessage.content.toLowerCase().includes("portfólio") ||
      lastUserMessage.content.toLowerCase().includes("portfolio")
    ) {
      const portfolioResponse = await generatePortfolioResponse()
      return NextResponse.json({ success: true, response: portfolioResponse })
    }

    let threadId = existingThreadId
    if (!threadId) {
      const thread = await withRetry(() => openai.beta.threads.create())
      threadId = thread.id
    }

    await withRetry(() =>
      openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: lastUserMessage.content,
      }),
    )

    // Aqui está a parte crucial: usar o assistant_id sem sobrescrever as instruções
    const run = await withRetry(() =>
      openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID!,
        timeout_in_seconds: 40,
      }),
    )

    let runStatus = await withRetry(() => openai.beta.threads.runs.retrieve(threadId, run.id))
    const startTime = Date.now()
    const maxWaitTime = 35000

    while (runStatus.status !== "completed") {
      if (Date.now() - startTime > maxWaitTime) break
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
        console.log("Status atualizado do run:", runStatus.status)
      } catch (error) {
        console.error("Erro ao verificar status do run:", error)
        break
      }

      if (["failed", "cancelled"].includes(runStatus.status)) {
        console.error("Run falhou ou foi cancelado:", runStatus)
        break
      }
    }

    const threadMessages = await withRetry(() => openai.beta.threads.messages.list(threadId))
    const assistantMessage = threadMessages.data.find((msg) => msg.role === "assistant")

    if (assistantMessage && assistantMessage.content[0].type === "text") {
      const responseText = assistantMessage.content[0].text.value
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(responseText))
          controller.close()
        },
      })

      const response = new NextResponse(stream)
      response.headers.set("X-Thread-ID", threadId)
      return response
    }

    return NextResponse.json({
      error: "Não foi possível obter resposta do assistente.",
      fallbackResponse: "Desculpe, não consegui processar sua solicitação agora.",
    })
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
