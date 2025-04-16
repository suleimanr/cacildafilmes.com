import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    console.log("Verificando configuração do OpenAI Assistant")

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

      return NextResponse.json({
        success: true,
        message: "OpenAI Assistant configurado corretamente",
        assistant: {
          id: assistant.id,
          name: assistant.name,
          model: assistant.model,
          created_at: assistant.created_at,
        },
      })
    } catch (error) {
      console.error("Erro ao verificar assistente:", error)
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
