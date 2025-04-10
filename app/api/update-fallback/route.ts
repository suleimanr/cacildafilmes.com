import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import * as path from "path"

export async function GET() {
  try {
    console.log("Buscando vídeos da tabela videosprod...")

    // Buscar todos os vídeos da tabela videosprod
    const { data, error } = await supabase.from("videosprod").select("*").order("id", { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar vídeos: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Nenhum vídeo encontrado na tabela videosprod")
    }

    console.log(`Encontrados ${data.length} vídeos`)

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

    // Gerar o código para o arquivo constants.ts
    const constantsCode = `// Arquivo gerado automaticamente pela API update-fallback
// Última atualização: ${new Date().toLocaleString("pt-BR")}
// Total de vídeos: ${processedVideos.length}

export const FALLBACK_VIDEOS = ${JSON.stringify(processedVideos, null, 2)}
`

    // Caminho para o arquivo constants.ts
    const constantsPath = path.join(process.cwd(), "lib", "constants.ts")

    // Em produção, não podemos escrever no sistema de arquivos
    // Então retornamos o código para o usuário copiar

    return NextResponse.json({
      success: true,
      message: "Código gerado com sucesso",
      count: processedVideos.length,
      code: constantsCode,
      videos: processedVideos,
    })
  } catch (error) {
    console.error("Erro:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
