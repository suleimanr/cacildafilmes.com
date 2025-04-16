import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    // Verificar se a chave da API está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY não configurada",
      })
    }

    // Tentar criar uma instância da OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Tentar fazer uma chamada simples para testar a conexão
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Olá" }],
      max_tokens: 5,
    })

    return NextResponse.json({
      success: true,
      message: "Conexão com OpenAI bem-sucedida",
      response: completion.choices[0]?.message?.content,
    })
  } catch (error) {
    console.error("Erro ao testar conexão com OpenAI:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
