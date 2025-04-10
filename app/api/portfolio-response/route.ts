import { NextResponse } from "next/server"
import { generatePortfolioResponse } from "@/lib/portfolio-helper"

export async function GET() {
  try {
    const response = await generatePortfolioResponse()

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error("Erro ao gerar resposta de portfólio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao gerar resposta de portfólio",
      },
      { status: 500 },
    )
  }
}
