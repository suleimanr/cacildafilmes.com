import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias")
  process.exit(1)
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateFallbackVideos() {
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
    const constantsCode = `// Arquivo gerado automaticamente pelo script update-fallback-videos.ts
// Última atualização: ${new Date().toLocaleString("pt-BR")}
// Total de vídeos: ${processedVideos.length}

export const FALLBACK_VIDEOS = ${JSON.stringify(processedVideos, null, 2)}
`

    // Caminho para o arquivo constants.ts
    const constantsPath = path.join(process.cwd(), "lib", "constants.ts")

    // Salvar o arquivo
    fs.writeFileSync(constantsPath, constantsCode)

    console.log(`Arquivo lib/constants.ts atualizado com sucesso com ${processedVideos.length} vídeos`)

    // Exibir os primeiros 3 vídeos como exemplo
    console.log("\nExemplo dos primeiros 3 vídeos:")
    processedVideos.slice(0, 3).forEach((video, index) => {
      console.log(`\n[${index + 1}] ${video.title} (${video.vimeo_id})`)
      console.log(`   Cliente: ${video.client}`)
      console.log(`   Categoria: ${video.category}`)
      console.log(`   Descrição: ${video.description.substring(0, 100)}...`)
    })
  } catch (error) {
    console.error("Erro:", error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Executar a função principal
updateFallbackVideos()
