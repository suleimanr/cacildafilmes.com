import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getVideoTableName } from "@/lib/supabase"

// Adicione logs para depuração e certifique-se de que as categorias estão sendo retornadas corretamente
export async function GET(req: Request) {
  console.log("Iniciando busca de vídeos")
  try {
    // Adicionar um parâmetro de cache-busting para garantir dados atualizados
    const url = new URL(req.url)
    const cacheBuster = url.searchParams.get("t")
    console.log(`Requisição com cache-buster: ${cacheBuster || "não fornecido"}`)

    const tableName = getVideoTableName()
    console.log(`Buscando vídeos na tabela: ${tableName}`)

    const { data, error } = await supabase
      .from(tableName)
      .select("id, title, vimeo_id, category, description, client, production, creation")
      .order("id", { ascending: true })

    if (error) {
      console.error(`Erro ao buscar vídeos da tabela ${tableName}:`, error)
      throw error
    }

    // Garantir que todos os vídeos tenham uma categoria normalizada
    const processedVideos = data.map((video) => ({
      ...video,
      category: video.category ? video.category.toLowerCase().trim() : "sem-categoria",
    }))

    console.log(`Vídeos encontrados na tabela ${tableName}:`, processedVideos)

    // Extrair categorias únicas para depuração
    const categories = [...new Set(processedVideos.map((v) => v.category))]
    console.log("Categorias encontradas:", categories)

    return NextResponse.json({
      success: true,
      videos: processedVideos,
      timestamp: Date.now(), // Adicionar timestamp para verificar se os dados são frescos
    })
  } catch (error) {
    console.error("Erro ao listar vídeos:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao listar vídeos", error: error.message },
      { status: 500 },
    )
  }
}
