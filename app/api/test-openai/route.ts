import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    openaiKeyConfigured: !!process.env.OPENAI_API_KEY,
    assistantIdConfigured: !!process.env.OPENAI_ASSISTANT_ID,
    openaiKeyFirstChars: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.substring(0, 5) + "..."
      : "não configurado",
    assistantId: process.env.OPENAI_ASSISTANT_ID || "não configurado",
  })
}
