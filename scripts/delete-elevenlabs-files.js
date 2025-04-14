// Script para excluir arquivos relacionados ao ElevenLabs
const fs = require("fs")
const path = require("path")

// Função para encontrar arquivos com nomes relacionados ao ElevenLabs
function findElevenLabsFiles(dir) {
  let results = []

  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`)
    return results
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)

    // Pular diretórios node_modules, .next, .git
    if (itemPath.includes("node_modules") || itemPath.includes(".next") || itemPath.includes(".git")) {
      continue
    }

    try {
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        results = results.concat(findElevenLabsFiles(itemPath))
      } else if (stat.isFile()) {
        // Verificar se o nome do arquivo contém "elevenlabs" ou "11labs"
        if (
          item.toLowerCase().includes("elevenlabs") ||
          item.toLowerCase().includes("11labs") ||
          item.toLowerCase().includes("eleven-labs")
        ) {
          results.push(itemPath)
        }
      }
    } catch (error) {
      console.error(`Erro ao acessar ${itemPath}:`, error.message)
    }
  }

  return results
}

// Encontrar e excluir arquivos relacionados ao ElevenLabs
console.log("Buscando arquivos relacionados ao ElevenLabs...")
const files = findElevenLabsFiles(".")
console.log(`Encontrados ${files.length} arquivos relacionados ao ElevenLabs.`)

// Excluir cada arquivo
let deletedCount = 0
for (const file of files) {
  try {
    fs.unlinkSync(file)
    console.log(`Excluído: ${file}`)
    deletedCount++
  } catch (error) {
    console.error(`Erro ao excluir ${file}:`, error.message)
  }
}

console.log(`Exclusão concluída! ${deletedCount} arquivos foram excluídos.`)
