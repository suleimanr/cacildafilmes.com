import { NextResponse } from "next/server"
import OpenAI from "openai"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import os from "os"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    // Verificar se a requisição é multipart/form-data
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Formato de requisição inválido" }, { status: 400 })
    }

    // Processar o upload do arquivo usando FormData
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Verificar se é um PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "O arquivo deve ser um PDF" }, { status: 400 })
    }

    // Salvar o arquivo temporariamente
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Criar um nome de arquivo temporário único
    const tempDir = os.tmpdir()
    const tempFilePath = join(tempDir, `briefing-${uuidv4()}.pdf`)

    // Escrever o arquivo no sistema de arquivos
    await writeFile(tempFilePath, buffer)

    // Importar pdf-parse dinamicamente para evitar problemas no cliente
    const pdfParse = (await import("pdf-parse")).default
    const pdfData = await pdfParse(buffer)
    const content = pdfData.text

    // Verificar se o conteúdo é válido
    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: "O PDF parece estar vazio ou ilegível" }, { status: 400 })
    }

    // Criar uma thread para enviar a mensagem ao assistente
    const thread = await openai.beta.threads.create()

    // Adicionar a mensagem com o conteúdo do briefing
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Aqui está o briefing extraído do PDF:

${content}

Com base nesse briefing, crie um roteiro completo de videoaula, com linguagem clara, profunda, envolvente e com começo, meio e fim. Use o estilo falado, aplique os fundamentos da base da Cacilda Filmes, e formate com colchetes para sugestões visuais.`,
    })

    // Executar o assistente
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID || "",
    })

    // Aguardar a conclusão do processamento
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    const start = Date.now()
    const maxWaitTime = 60000 // 60 segundos

    while (
      runStatus.status !== "completed" &&
      runStatus.status !== "failed" &&
      runStatus.status !== "cancelled" &&
      runStatus.status !== "expired" &&
      Date.now() - start < maxWaitTime
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      console.log("Status atual:", runStatus.status)
    }

    // Verificar se o processamento foi concluído com sucesso
    if (runStatus.status !== "completed") {
      console.log("Run não completado, status final:", runStatus)
      if (runStatus.last_error) {
        console.error("Erro no run:", runStatus.last_error)
      }

      // Fallback para o modelo simples
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em roteiros da Cacilda Filmes. Crie um roteiro completo baseado no briefing fornecido.",
          },
          {
            role: "user",
            content: `Briefing extraído do PDF:

${content}

Crie um roteiro completo de videoaula com base nesse briefing.`,
          },
        ],
        temperature: 0.7,
      })

      const fallbackResponse = completion.choices[0]?.message?.content || "Não foi possível gerar um roteiro."

      // Retornar como stream
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallbackResponse))
          controller.close()
        },
      })

      return new NextResponse(stream)
    }

    // Buscar a resposta do assistente
    const messages = await openai.beta.threads.messages.list(thread.id)
    const assistantMessage = messages.data.find((m) => m.role === "assistant")

    if (!assistantMessage || !assistantMessage.content || assistantMessage.content.length === 0) {
      return NextResponse.json({ error: "Não foi possível gerar o roteiro" }, { status: 500 })
    }

    // Extrair o conteúdo da resposta
    let roteiro = ""
    for (const part of assistantMessage.content) {
      if (part.type === "text") {
        roteiro += part.text.value
      }
    }

    // Retornar como stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(roteiro))
        controller.close()
      },
    })

    return new NextResponse(stream)
  } catch (error) {
    console.error("Erro ao processar o briefing:", error)
    return NextResponse.json({ error: "Erro interno ao processar o briefing" }, { status: 500 })
  }
}
