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
    console.log("API /api/chat chamada")

    // Verificar variáveis de ambiente
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada")
      return NextResponse.json({ error: "Chave da API OpenAI não configurada" }, { status: 500 })
    }

    if (!process.env.OPENAI_ASSISTANT_ID) {
      console.error("OPENAI_ASSISTANT_ID não configurado")
      return NextResponse.json({ error: "ID do Assistente OpenAI não configurado" }, { status: 500 })
    }

    // Extrair dados da requisição
    const body = await req.json()
    console.log("Corpo da requisição recebido")

    const messages = body.messages || []
    const existingThreadId = body.threadId

    // Verificar se há mensagens
    if (!messages || messages.length === 0) {
      console.error("Nenhuma mensagem recebida")
      return NextResponse.json({ error: "Nenhuma mensagem recebida" }, { status: 400 })
    }

    // Extrair a última mensagem do usuário
    const lastUserMessage = messages.filter((msg: any) => msg.role === "user").pop()
    if (!lastUserMessage) {
      console.error("Nenhuma mensagem do usuário encontrada")
      return NextResponse.json({ error: "Nenhuma mensagem do usuário encontrada" }, { status: 400 })
    }

    console.log("Última mensagem do usuário:", lastUserMessage.content)

    // Verificar se é uma pergunta sobre portfólio
    if (
      lastUserMessage.content.toLowerCase().includes("portfólio") ||
      lastUserMessage.content.toLowerCase().includes("portfolio")
    ) {
      console.log("Pergunta sobre portfólio detectada, usando resposta específica")
      const portfolioResponse = await generatePortfolioResponse()
      return NextResponse.json({ success: true, response: portfolioResponse })
    }

    // Criar ou usar thread existente
    let threadId = existingThreadId
    if (!threadId) {
      console.log("Criando nova thread")
      try {
        const thread = await openai.beta.threads.create()
        threadId = thread.id
        console.log("Nova thread criada:", threadId)
      } catch (error) {
        console.error("Erro ao criar thread:", error)
        return NextResponse.json({ error: "Erro ao criar thread" }, { status: 500 })
      }
    } else {
      console.log("Usando thread existente:", threadId)
    }

    // Adicionar mensagem à thread
    try {
      console.log("Adicionando mensagem à thread")
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: lastUserMessage.content,
      })
      console.log("Mensagem adicionada com sucesso")
    } catch (error) {
      console.error("Erro ao adicionar mensagem:", error)
      return NextResponse.json({ error: "Erro ao adicionar mensagem à thread" }, { status: 500 })
    }

    // Executar o assistente
    let run
    try {
      console.log("Executando assistente com ID:", process.env.OPENAI_ASSISTANT_ID)
      run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID,
      })
      console.log("Run criado com sucesso, ID:", run.id)
    } catch (error) {
      console.error("Erro ao criar run:", error)
      return NextResponse.json({ error: "Erro ao executar assistente" }, { status: 500 })
    }

    // Aguardar conclusão do run
    let runStatus
    try {
      console.log("Verificando status do run")
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
      console.log("Status inicial do run:", runStatus.status)

      const startTime = Date.now()
      const maxWaitTime = 35000 // 35 segundos

      while (runStatus.status !== "completed") {
        // Verificar timeout
        if (Date.now() - startTime > maxWaitTime) {
          console.log("Timeout atingido, retornando resposta parcial")
          break
        }

        // Aguardar um pouco antes de verificar novamente
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Verificar status novamente
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
        console.log("Status atualizado do run:", runStatus.status)

        // Verificar se houve erro
        if (runStatus.status === "failed" || runStatus.status === "cancelled") {
          console.error("Run falhou ou foi cancelado:", runStatus)
          return NextResponse.json(
            {
              error: "Falha ao processar a mensagem",
              details: runStatus,
            },
            { status: 500 },
          )
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status do run:", error)
      return NextResponse.json({ error: "Erro ao verificar status da execução" }, { status: 500 })
    }

    // Obter mensagens da thread
    try {
      console.log("Buscando mensagens da thread")
      const threadMessages = await openai.beta.threads.messages.list(threadId)
      console.log("Mensagens obtidas:", threadMessages.data.length)

      // Encontrar a resposta do assistente (a última mensagem)
      const assistantMessage = threadMessages.data.find((msg) => msg.role === "assistant")

      if (
        assistantMessage &&
        assistantMessage.content &&
        assistantMessage.content.length > 0 &&
        assistantMessage.content[0].type === "text"
      ) {
        const responseText = assistantMessage.content[0].text.value
        console.log("Resposta do assistente obtida, tamanho:", responseText.length)

        // Retornar a resposta como stream
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(responseText))
            controller.close()
          },
        })

        // Adicionar o threadId ao cabeçalho da resposta
        const response = new NextResponse(stream)
        response.headers.set("X-Thread-ID", threadId)
        return response
      } else {
        console.error("Resposta do assistente não encontrada ou em formato inválido")
        return NextResponse.json({
          error: "Resposta do assistente não encontrada",
          fallbackResponse: "Desculpe, não consegui processar sua solicitação agora.",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error)
      return NextResponse.json({ error: "Erro ao buscar resposta" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro geral:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
