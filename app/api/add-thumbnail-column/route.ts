import { NextResponse } from "next/server"
import { getVideoTableName } from "@/lib/supabase"

export async function GET() {
  try {
    const tableName = getVideoTableName()

    // Instead of trying to check or add the column, let's just return instructions
    // for the user to add it manually

    return NextResponse.json({
      success: true,
      needsManualAction: true,
      message: `Para adicionar suporte a thumbnails personalizadas, execute o seguinte SQL no painel do Supabase:`,
      sql: `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;`,
    })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar requisição",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
