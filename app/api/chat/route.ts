import { NextResponse } from "next/server"
import OpenAI from "openai"
import { generatePortfolioResponse } from "@/lib/portfolio-helper"

// Inicializar o cliente OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Aumentar o timeout para 60 segundos (máximo permitido no Vercel)
export const maxDuration = 60

// Função para implementar retry com backoff exponencial
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0
  while (true) {
    try {
      return await fn()
    } catch (error: any) {
      retries++
      if (retries > maxRetries) {
        throw error
      }

      // Calcular o delay com backoff exponencial
      const delay = initialDelay * Math.pow(2, retries - 1)
      console.log(`Tentativa ${retries} falhou. Tentando novamente em ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export async function POST(req: Request) {
  try {
    // Verificar se a chave da API está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada")
      return NextResponse.json({ error: "Chave da API OpenAI não configurada" }, { status: 500 })
    }

    // Verificar se o ID do assistente está configurado
    if (!process.env.OPENAI_ASSISTANT_ID) {
      console.error("OPENAI_ASSISTANT_ID não configurado")
      return NextResponse.json({ error: "ID do Assistente OpenAI não configurado" }, { status: 500 })
    }

    const { messages } = await req.json()

    // Extrair a última mensagem do usuário
    const lastUserMessage = messages.filter((msg: any) => msg.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({ error: "Nenhuma mensagem do usuário encontrada" }, { status: 400 })
    }

    // Verificar se é uma pergunta sobre portfólio
    if (
      lastUserMessage.content.toLowerCase().includes("portfólio") ||
      lastUserMessage.content.toLowerCase().includes("portfolio")
    ) {
      const portfolioResponse = await generatePortfolioResponse()
      return NextResponse.json({
        success: true,
        response: portfolioResponse,
      })
    }

    // Verificar se é uma pergunta complexa
    const isComplexQuery = shouldUseAssistant(lastUserMessage.content)

    if (isComplexQuery) {
      try {
        // Para perguntas complexas, usar o Assistente configurado no dashboard da OpenAI
        console.log("Usando o Assistente OpenAI para pergunta complexa")

        // Criar uma thread ou usar uma existente com retry
        const thread = await withRetry(() => openai.beta.threads.create())

        // Adicionar a mensagem do usuário à thread com retry
        await withRetry(() =>
          openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: lastUserMessage.content,
          }),
        )

        // Executar o assistente na thread com retry e timeout reduzido
        const run = await withRetry(() =>
          openai.beta.threads.runs.create(thread.id, {
            assistant_id: process.env.OPENAI_ASSISTANT_ID!,
            // Definir um timeout mais curto para evitar que a função serverless expire
            timeout_in_seconds: 40,
          }),
        )

        // Aguardar a conclusão do run com timeout
        let runStatus = await withRetry(() => openai.beta.threads.runs.retrieve(thread.id, run.id))

        // Definir um timeout para evitar que a função fique presa
        const startTime = Date.now()
        const maxWaitTime = 35000 // 35 segundos

        while (runStatus.status !== "completed") {
          // Verificar se excedeu o tempo máximo de espera
          if (Date.now() - startTime > maxWaitTime) {
            console.log("Tempo máximo de espera excedido, retornando resposta parcial")
            break
          }

          // Aguardar um pouco antes de verificar novamente
          await new Promise((resolve) => setTimeout(resolve, 1000))

          try {
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
          } catch (error) {
            console.error("Erro ao verificar status do run:", error)
            break
          }

          // Se houver erro, interromper o loop
          if (runStatus.status === "failed" || runStatus.status === "cancelled") {
            console.error("Run falhou ou foi cancelado:", runStatus)
            break
          }
        }

        // Obter as mensagens da thread
        const threadMessages = await withRetry(() => openai.beta.threads.messages.list(thread.id))

        // Encontrar a resposta do assistente (a última mensagem)
        const assistantMessage = threadMessages.data.find((msg) => msg.role === "assistant")

        if (assistantMessage && assistantMessage.content[0].type === "text") {
          const responseText = assistantMessage.content[0].text.value

          // Retornar a resposta como stream
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(responseText))
              controller.close()
            },
          })

          return new NextResponse(stream)
        }

        // Fallback se não conseguir obter a resposta do assistente
        return NextResponse.json(
          {
            error: "Não foi possível obter resposta completa do assistente",
            fallbackResponse:
              "Desculpe, estou com dificuldades para processar sua solicitação no momento. Poderia tentar novamente com uma pergunta mais simples?",
          },
          { status: 200 },
        )
      } catch (error) {
        console.error("Erro ao usar o assistente:", error)

        // Fallback para o modelo mais simples em caso de erro
        console.log("Usando fallback com Chat Completions devido a erro no Assistant")

        return handleWithChatCompletions(messages)
      }
    } else {
      // Para perguntas simples, continuar usando o Chat Completions com o prompt local
      return handleWithChatCompletions(messages)
    }
  } catch (error) {
    console.error("Erro ao processar mensagem:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
      },
      { status: 500 },
    )
  }
}

// Função para processar com Chat Completions (modelo mais rápido)
async function handleWithChatCompletions(messages: any[]) {
  console.log("Usando Chat Completions para pergunta simples")

  try {
    // Preparar mensagens para a API da OpenAI
    const apiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Removi a mensagem de sistema para evitar conflitos com as configurações existentes

    // Fazer a requisição para a API da OpenAI com retry
    const completion = await withRetry(() =>
      openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Usando o mesmo modelo que está no dashboard
        messages: apiMessages,
        temperature: 0.7,
        stream: true,
      }),
    )

    // Processar a resposta como stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ""
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }

        controller.close()
      },
    })

    return new NextResponse(stream)
  } catch (error) {
    console.error("Erro ao usar Chat Completions:", error)

    // Fallback para resposta estática em caso de erro
    const encoder = new TextEncoder()
    const fallbackResponse =
      "Desculpe, estou enfrentando algumas dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato pelo email atendimento@cacildafilmes.com."

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fallbackResponse))
        controller.close()
      },
    })

    return new NextResponse(stream)
  }
}

// Função para determinar se é uma pergunta complexa
function shouldUseAssistant(message: string) {
  const complexQueryKeywords = [
    "roteiro",
    "briefing",
    "ideia",
    "criar",
    "desenvolver",
    "estratégia",
    "conceito",
    "planejar",
    "sugestão",
    "como fazer",
    "ajuda com",
    "preciso de",
    "elaborar",
  ]

  const lowercaseMessage = message.toLowerCase()

  return (
    complexQueryKeywords.some((keyword) => lowercaseMessage.includes(keyword)) ||
    message.length > 100 ||
    message.includes("?")
  )
}
