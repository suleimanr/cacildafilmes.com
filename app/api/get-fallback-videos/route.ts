import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Função para determinar qual tabela usar com base no ambiente
function getVideoTableName() {
  return process.env.NODE_ENV === "production" ? "videosprod" : "videos"
}

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão definidas
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Variáveis de ambiente do Supabase não definidas" },
        { status: 500 },
      )
    }

    // Determinar qual tabela usar
    const tableName = getVideoTableName()
    console.log(`Buscando vídeos da tabela ${tableName}...`)

    // Buscar todos os vídeos da tabela apropriada
    const { data, error } = await supabase.from(tableName).select("*").order("id", { ascending: true })

    if (error) {
      console.error(`Erro ao buscar vídeos da tabela ${tableName}:`, error)
      return NextResponse.json({ success: false, error: `Erro ao buscar vídeos: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: `Nenhum vídeo encontrado na tabela ${tableName}` },
        { status: 404 },
      )
    }

    // Processar os vídeos para garantir que todos os campos necessários existam
    const processedVideos = data.map((video) => ({
      vimeo_id: video.vimeo_id || "",
      title: video.title || "Sem título",
      category: video.category ? video.category.toLowerCase().trim() : "sem-categoria",
      description: video.description || `Vídeo ${video.title || "sem título"} produzido pela Cacilda Filmes.`,
      client: video.client || "Cacilda Filmes",
      production: video.production || "Cacilda Filmes",
      creation: video.creation || "Departamento Criativo",
    }))

    // Gerar o código para o arquivo de constantes
    const fallbackVideosCode = `// Arquivo gerado automaticamente
// Última atualização: ${new Date().toLocaleString("pt-BR")}
// Total de vídeos: ${processedVideos.length}

export const FALLBACK_VIDEOS = ${JSON.stringify(processedVideos, null, 2)}
`

    return NextResponse.json({
      success: true,
      videos: processedVideos,
      code: fallbackVideosCode,
      count: processedVideos.length,
      tableName: tableName,
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Erro não tratado:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno do servidor: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      },
      { status: 500 },
    )
  }
}
