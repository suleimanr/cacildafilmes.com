import { supabase } from "../lib/supabase"
import { getVideoTableName } from "../lib/supabase"

async function addThumbnailColumn() {
  console.log("Verificando se a coluna thumbnail_url existe...")

  try {
    const tableName = getVideoTableName()
    console.log(`Usando tabela: ${tableName}`)

    // Verificar se a coluna já existe
    const { data: columns, error: columnsError } = await supabase.from(tableName).select("thumbnail_url").limit(1)

    if (columnsError) {
      // Se o erro for porque a coluna não existe
      if (columnsError.message.includes('column "thumbnail_url" does not exist')) {
        console.log("A coluna thumbnail_url não existe. Adicionando...")

        // Adicionar a coluna usando SQL
        const { error: alterError } = await supabase.rpc("add_thumbnail_column", {
          table_name: tableName,
        })

        if (alterError) {
          console.error("Erro ao adicionar coluna:", alterError)
          return
        }

        console.log("Coluna thumbnail_url adicionada com sucesso!")
      } else {
        console.error("Erro ao verificar colunas:", columnsError)
      }
    } else {
      console.log("A coluna thumbnail_url já existe.")
    }
  } catch (error) {
    console.error("Erro ao adicionar coluna thumbnail_url:", error)
  }
}

// Executar a função
addThumbnailColumn()
