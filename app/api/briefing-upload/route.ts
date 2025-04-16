import { NextResponse } from "next/server"
import { IncomingForm } from "formidable"
import fs from "fs"
import { promisify } from "util"
import OpenAI from "openai"

export const config = {
  api: {
    bodyParser: false,
  },
}

const readFile = promisify(fs.readFile)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    // Usar formidable para processar o upload do arquivo
    const form = new IncomingForm({ uploadDir: "/tmp", keepExtensions: true })

    const data: any = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const uploadedFile = data.files.file?.[0] || data.files.briefing?.[0]
    if (!uploadedFile) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 400 })
    }

    // Extrair texto do PDF usando pdf-parse com importação dinâmica
    const fileBuffer = await readFile(uploadedFile.filepath)

    // Importação dinâmica do pdf-parse para evitar problemas durante o build
    const pdfParse = (await import("pdf-parse")).default
    const pdfData = await pdfParse(fileBuffer)
    const content = pdfData.text

    // Limpar o arquivo temporário
    fs.unlinkSync(uploadedFile.filepath)

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
