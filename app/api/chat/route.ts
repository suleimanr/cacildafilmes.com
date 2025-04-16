import { NextResponse } from "next/server"
import OpenAI from "openai"
import { generatePortfolioResponse } from "@/lib/portfolio-helper"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_ASSISTANT_ID) {
      return NextResponse.json({ error: "Variáveis de ambiente ausentes." }, { status: 500 })
    }

    const body = await req.json()
    const { messages, useSimpleModel } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem recebida." }, { status: 400 })
    }

    const userMessage = messages.filter((m: any) => m.role === "user").pop()
    if (!userMessage) {
      return NextResponse.json({ error: "Mensagem do usuário ausente." }, { status: 400 })
    }

    // Verificar se é uma pergunta sobre portfólio
    if (
      userMessage.content.toLowerCase().includes("portfólio") ||
      userMessage.content.toLowerCase().includes("portfolio")
    ) {
      console.log("Pergunta sobre portfólio detectada, usando resposta específica")
      const portfolioResponse = await generatePortfolioResponse()

      // Retornar a resposta como stream
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(portfolioResponse))
          controller.close()
        },
      })

      return new NextResponse(stream)
    }

    if (useSimpleModel) {
      // Fallback direto para GPT-3.5-turbo
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é a assistente virtual da Cacilda Filmes, produtora de vídeo especializada em educação corporativa. Seja clara, estratégica e forneça roteiros, ideias e soluções criativas com profundidade, linguagem falada e técnicas de educação corporativa.",
          },
          { role: "user", content: userMessage.content },
        ],
        stream: true,
        temperature: 0.7,
      })

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        },
      })

      return new NextResponse(stream)
    }

    // Chat via Assistant com GPT-3.5 configurado no painel
    console.log("Usando OpenAI Assistant")
    const thread = await openai.beta.threads.create()
    console.log("Thread criada:", thread.id)

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage.content,
    })
    console.log("Mensagem adicionada à thread")

    console.log("Executando assistente com ID:", process.env.OPENAI_ASSISTANT_ID)
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
    })
    console.log("Run criado:", run.id)

    // Esperar o run finalizar (máximo 30s)
    const start = Date.now()
    const timeout = 60000 // 60 segundos
    let status = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    console.log("Status inicial:", status.status)

    while (
      status.status !== "completed" &&
      status.status !== "failed" &&
      status.status !== "cancelled" &&
      status.status !== "expired" &&
      Date.now() - start < timeout
    ) {
      await new Promise((res) => setTimeout(res, 1000))
      status = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      console.log("Status atualizado:", status.status)
    }

    if (status.status !== "completed") {
      console.log("Run não completado, status final:", status.status)
      console.log("Detalhes completos do status:", JSON.stringify(status, null, 2))
      if (status.last_error) {
        console.error("Erro no run:", status.last_error)
      }

      return NextResponse.json({ error: "Tempo excedido ou erro no processamento." }, { status: 500 })
    }

    console.log("Run completado, buscando mensagens")
    const messagesFromThread = await openai.beta.threads.messages.list(thread.id)
    const assistantMsg = messagesFromThread.data.find((m) => m.role === "assistant")
    console.log("Mensagens encontradas:", messagesFromThread.data.length)

    let fullText = ""
    if (assistantMsg && assistantMsg.content) {
      for (const part of assistantMsg.content) {
        if (part.type === "text") {
          fullText += part.text.value
        }
      }
      console.log("Resposta do assistente obtida, tamanho:", fullText.length)
    } else {
      console.log("Nenhuma mensagem do assistente encontrada")
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fullText))
        controller.close()
      },
    })

    return new NextResponse(stream)
  } catch (error: any) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno", details: error.message }, { status: 500 })
  }
}
