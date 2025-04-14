// Script para remover completamente diretórios específicos relacionados ao ElevenLabs
const fs = require("fs")
const path = require("path")

console.log("REMOVENDO DIRETÓRIOS RELACIONADOS AO ELEVENLABS")
console.log("==========================================================")

// Lista de diretórios a serem removidos
const directoriesToRemove = [
  "app/@11labs",
  "app/@elevenlabs",
  "app/elevenlabs",
  "components/@11labs",
  "components/elevenlabs",
  "lib/elevenlabs",
  "types/elevenlabs",
  "docs/elevenlabs",
]

// Função para verificar se um diretório existe e removê-lo
function removeDirectoryIfExists(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath)

  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Removendo diretório: ${dirPath}`)
      fs.rmSync(fullPath, { recursive: true, force: true })
      console.log(`✅ Diretório removido com sucesso: ${dirPath}`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao remover diretório ${dirPath}:`, error.message)
      return false
    }
  } else {
    console.log(`Diretório não encontrado: ${dirPath}`)
    return false
  }
}

// Remover cada diretório da lista
let removedCount = 0
for (const dir of directoriesToRemove) {
  if (removeDirectoryIfExists(dir)) {
    removedCount++
  }
}

// Procurar por outros diretórios que possam conter "elevenlabs" ou "11labs" no nome
function findDirectoriesWithPattern(baseDir, pattern, excludeDirs = ["node_modules", ".git", ".next"]) {
  let results = []

  if (!fs.existsSync(baseDir)) return results

  const items = fs.readdirSync(baseDir)

  for (const item of items) {
    const fullPath = path.join(baseDir, item)

    // Pular diretórios excluídos
    if (excludeDirs.some((excludeDir) => fullPath.includes(excludeDir))) {
      continue
    }

    try {
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // Verificar se o nome do diretório contém o padrão
        if (pattern.test(item)) {
          results.push(fullPath)
        }

        // Continuar procurando em subdiretórios
        results = results.concat(findDirectoriesWithPattern(fullPath, pattern, excludeDirs))
      }
    } catch (error) {
      console.error(`Erro ao acessar ${fullPath}:`, error.message)
    }
  }

  return results
}

console.log("\nProcurando por outros diretórios relacionados ao ElevenLabs...")
const dirPattern = /(elevenlabs|11labs|ElevenLabs)/i
const additionalDirs = findDirectoriesWithPattern(process.cwd(), dirPattern)

if (additionalDirs.length > 0) {
  console.log(`Encontrados ${additionalDirs.length} diretórios adicionais relacionados ao ElevenLabs.`)

  for (const dir of additionalDirs) {
    try {
      console.log(`Removendo diretório adicional: ${dir}`)
      fs.rmSync(dir, { recursive: true, force: true })
      console.log(`✅ Diretório adicional removido com sucesso: ${dir}`)
      removedCount++
    } catch (error) {
      console.error(`❌ Erro ao remover diretório adicional ${dir}:`, error.message)
    }
  }
} else {
  console.log("Nenhum diretório adicional encontrado.")
}

console.log("\n==========================================================")
console.log(`Total de ${removedCount} diretórios removidos.`)
console.log("==========================================================")
