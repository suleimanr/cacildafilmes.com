import { NextResponse } from "next/server"
import { checkOpenAIConfig } from "@/lib/config"

export async function GET() {
  const config = checkOpenAIConfig()

  return NextResponse.json({
    isConfigured: config.isConfigured,
    missingVariables: config.missingVariables,
    environment: process.env.NODE_ENV,
  })
}
