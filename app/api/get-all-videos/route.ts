import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getVideoTableName } from "@/lib/supabase"
import { FALLBACK_VIDEOS } from "@/lib/constants"

export async function GET() {
  try {
    console.log("Buscando todos os vídeos para resposta de portfólio")

    // Determinar qual tabela usar
    const tableName = getVideoTableName()
    console.log(`Usando tabela: ${tableName}`)

    // Buscar todos os vídeos da tabela
    const { data, error } = await supabase.from(tableName).select("*").order("id", { ascending: true })

    if (error) {
      console.error(`Erro ao buscar vídeos da tabela ${tableName}:`, error)
      // Se houver erro, usar os vídeos de fallback
      return NextResponse.json({
        success: false,
        videos: FALLBACK_VIDEOS,
        message: "Usando dados de fallback devido a erro na consulta",
        error: error.message,
      })
    }

    // Se não houver vídeos, usar os de fallback
    if (!data || data.length === 0) {
      console.log("Nenhum vídeo encontrado na tabela, usando fallback")
      return NextResponse.json({
        success: true,
        videos: FALLBACK_VIDEOS,
        message: "Usando dados de fallback pois nenhum vídeo foi encontrado",
      })
    }

    console.log(`Encontrados ${data.length} vídeos na tabela ${tableName}`)

    // Processar os vídeos para garantir que todos os campos necessários existam
    const processedVideos = data.map((video) => ({
      ...video,
      // Garantir que a categoria exista e esteja normalizada
      category: video.category ? video.category.toLowerCase().trim() : "sem-categoria",
      // Garantir que outros campos existam com valores padrão se necessário
      client: video.client || "Cacilda Filmes",
      production: video.production || "Cacilda Filmes",
      creation: video.creation || "Departamento Criativo",
      description: video.description || `Vídeo ${video.title || "sem título"} produzido pela Cacilda Filmes.`,
    }))

    return NextResponse.json({
      success: true,
      videos: processedVideos,
      count: processedVideos.length,
    })
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error)
    // Em caso de erro, retornar os vídeos de fallback
    return NextResponse.json({
      success: false,
      videos: FALLBACK_VIDEOS,
      message: "Erro ao buscar vídeos, usando dados de fallback",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
