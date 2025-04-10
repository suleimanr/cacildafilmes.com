import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(req: Request) {
  try {
    console.log("Iniciando /api/chat/result")

    // Verificar variáveis de ambiente
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada")
      return NextResponse.json({ error: "Configuração da API OpenAI ausente." }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get("threadId")

    console.log("Parâmetros recebidos:", { threadId })

    if (!threadId) {
      console.error("threadId ausente")
      return NextResponse.json({ error: "threadId é obrigatório." }, { status: 400 })
    }

    try {
      console.log("Buscando mensagens da thread:", threadId)
      const messages = await openai.beta.threads.messages.list(threadId)

      // Log para depuração - ver todas as mensagens
      console.log("Mensagens encontradas:", messages.data.length)
      messages.data.forEach((msg, i) => {
        console.log(`Mensagem ${i + 1}:`, {
          id: msg.id,
          role: msg.role,
          created_at: msg.created_at,
          content_type: msg.content?.[0]?.type,
          has_content: !!msg.content?.length,
        })
      })

      // Encontrar a última mensagem do assistente
      const last = messages.data.find((m) => m.role === "assistant")

      if (!last) {
        console.log("Nenhuma mensagem do assistente encontrada")
        return NextResponse.json({
          message: "Aguarde um momento enquanto processo sua solicitação...",
        })
      }

      console.log("Mensagem do assistente encontrada, id:", last.id)

      // Log detalhado do conteúdo para depuração
      console.log("Conteúdo completo da mensagem:", JSON.stringify(last.content))

      // Extrair o conteúdo da mensagem
      let messageContent = ""
      if (last.content && last.content.length > 0) {
        for (const content of last.content) {
          if (content.type === "text") {
            messageContent += content.text.value
          }
        }
      }

      console.log("Conteúdo extraído:", messageContent)

      // Se a mensagem estiver vazia ou for a mensagem de erro padrão, tentar uma abordagem diferente
      if (!messageContent || messageContent.includes("enfrentando dificuldades técnicas")) {
        console.log("Mensagem vazia ou erro padrão detectado, tentando abordagem alternativa")

        // Tentar usar o modelo gpt-3.5-turbo diretamente como fallback
        try {
          console.log("Usando modelo gpt-3.5-turbo como fallback")

          // Obter as últimas mensagens do usuário para contexto
          const userMessages = messages.data.filter((m) => m.role === "user").slice(0, 3) // Pegar as 3 últimas mensagens do usuário

          const userContent = userMessages
            .map((m) => {
              if (m.content?.[0]?.type === "text") {
                return m.content[0].text.value
              }
              return ""
            })
            .join(" ")

          console.log("Contexto do usuário para fallback:", userContent)

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "Você é a assistente virtual da Cacilda Filmes, uma produtora de vídeo. Seja prestativa, amigável e forneça informações sobre os serviços da empresa, como produção de vídeos corporativos, publicidade, documentários e eventos.",
              },
              {
                role: "user",
                content: userContent || "Olá, gostaria de saber mais sobre a Cacilda Filmes",
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          })

          const fallbackResponse = completion.choices[0]?.message?.content
          console.log("Resposta de fallback gerada:", fallbackResponse)

          if (fallbackResponse) {
            return NextResponse.json({
              message: fallbackResponse,
              fallback: true,
            })
          }
        } catch (fallbackErr) {
          console.error("Erro no fallback:", fallbackErr)
        }
      }

      return NextResponse.json({
        message: messageContent || "Estou processando sua solicitação. Por favor, tente novamente em alguns instantes.",
      })
    } catch (err) {
      console.error("Erro ao buscar resultado:", err)
      return NextResponse.json({ error: "Erro ao buscar resultado." }, { status: 500 })
    }
  } catch (err) {
    console.error("[result] Erro geral:", err)
    return NextResponse.json({ error: "Erro ao buscar resultado." }, { status: 500 })
  }
}
