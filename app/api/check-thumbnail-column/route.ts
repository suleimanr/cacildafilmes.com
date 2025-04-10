import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getVideoTableName } from "@/lib/supabase"

export async function GET() {
  try {
    const tableName = getVideoTableName()
    console.log(`Verificando coluna thumbnail_url na tabela ${tableName}...`)

    // Método direto para verificar se a coluna existe
    // Se a coluna não existir, o Supabase retornará um erro
    const { data, error } = await supabase.from(tableName).select("thumbnail_url").limit(1)

    if (error) {
      // Check if the error is because the column doesn't exist
      if (error.message.includes('column "thumbnail_url" does not exist')) {
        console.log(`A coluna thumbnail_url não existe na tabela ${tableName}`)
        return NextResponse.json({
          success: true,
          exists: false,
          message: `A coluna thumbnail_url não existe na tabela ${tableName}`,
        })
      }

      // Some other error
      console.error("Erro ao verificar coluna:", error)
      return NextResponse.json(
        {
          success: false,
          exists: false,
          message: "Erro ao verificar coluna",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // If we got here, the column exists
    console.log(`A coluna thumbnail_url existe na tabela ${tableName}`)
    return NextResponse.json({
      success: true,
      exists: true,
      message: `A coluna thumbnail_url existe na tabela ${tableName}`,
    })
  } catch (error) {
    console.error("Erro ao verificar coluna thumbnail_url:", error)
    return NextResponse.json(
      {
        success: false,
        exists: false,
        message: "Erro ao verificar coluna thumbnail_url",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
