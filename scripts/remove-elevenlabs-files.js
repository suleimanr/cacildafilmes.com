// Script para remover completamente arquivos específicos relacionados ao ElevenLabs
const fs = require("fs")
const path = require("path")

console.log("REMOVENDO ARQUIVOS RELACIONADOS AO ELEVENLABS")
console.log("==========================================================")

// Lista de arquivos específicos a serem removidos
const filesToRemove = [
  "components/ElevenLabsStreaming.tsx",
  "components/ElevenLabsToolHandler.tsx",
  "components/AudioChat.tsx",
  "lib/elevenlabs-config.ts",
  "lib/elevenlabs-service.ts",
  "types/elevenlabs.ts",
  "docs/ELEVENLABS_INTEGRATION.md",
]

// Função para verificar se um arquivo existe e removê-lo
function removeFileIfExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath)

  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Removendo arquivo: ${filePath}`)
      fs.unlinkSync(fullPath)
      console.log(`✅ Arquivo removido com sucesso: ${filePath}`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao remover arquivo ${filePath}:`, error.message)
      return false
    }
  } else {
    console.log(`Arquivo não encontrado: ${filePath}`)
    return false
  }
}

// Remover cada arquivo da lista
let removedCount = 0
for (const file of filesToRemove) {
  if (removeFileIfExists(file)) {
    removedCount++
  }
}

// Procurar por outros arquivos que possam conter "elevenlabs" ou "11labs" no nome
function findFilesWithPattern(baseDir, pattern, excludeDirs = ["node_modules", ".git", ".next"]) {
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
        // Continuar procurando em subdiretórios
        results = results.concat(findFilesWithPattern(fullPath, pattern, excludeDirs))
      } else if (pattern.test(item)) {
        // Verificar se o nome do arquivo contém o padrão
        results.push(fullPath)
      }
    } catch (error) {
      console.error(`Erro ao acessar ${fullPath}:`, error.message)
    }
  }

  return results
}

console.log("\nProcurando por outros arquivos relacionados ao ElevenLabs...")
const filePattern = /(elevenlabs|11labs|ElevenLabs)/i
const additionalFiles = findFilesWithPattern(process.cwd(), filePattern)

if (additionalFiles.length > 0) {
  console.log(`Encontrados ${additionalFiles.length} arquivos adicionais relacionados ao ElevenLabs.`)

  for (const file of additionalFiles) {
    try {
      console.log(`Removendo arquivo adicional: ${file}`)
      fs.unlinkSync(file)
      console.log(`✅ Arquivo adicional removido com sucesso: ${file}`)
      removedCount++
    } catch (error) {
      console.error(`❌ Erro ao remover arquivo adicional ${file}:`, error.message)
    }
  }
} else {
  console.log("Nenhum arquivo adicional encontrado.")
}

console.log("\n==========================================================")
console.log(`Total de ${removedCount} arquivos removidos.`)
console.log("==========================================================")
