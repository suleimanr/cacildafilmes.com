// Script para remover arquivos específicos que podem estar causando problemas
const fs = require("fs")
const path = require("path")

console.log("REMOVENDO ARQUIVOS E DIRETÓRIOS PROBLEMÁTICOS")
console.log("==========================================================")

// Lista de arquivos e diretórios problemáticos
const problematicPaths = [
  "app/@11labs",
  "app/@elevenlabs",
  "app/elevenlabs",
  "components/@11labs",
  "components/ElevenLabsStreaming.tsx",
  "components/ElevenLabsToolHandler.tsx",
  "components/AudioChat.tsx",
  "lib/elevenlabs-config.ts",
  "lib/elevenlabs-service.ts",
  "types/elevenlabs.ts",
  "docs/ELEVENLABS_INTEGRATION.md",
  ".next",
]

console.log("Removendo arquivos e diretórios problemáticos...")

let removedCount = 0
let errorCount = 0

for (const itemPath of problematicPaths) {
  const fullPath = path.join(process.cwd(), itemPath)

  if (fs.existsSync(fullPath)) {
    try {
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        console.log(`Removendo diretório: ${itemPath}`)
        fs.rmSync(fullPath, { recursive: true, force: true })
      } else {
        console.log(`Removendo arquivo: ${itemPath}`)
        fs.unlinkSync(fullPath)
      }

      console.log(`✅ Removido com sucesso: ${itemPath}`)
      removedCount++
    } catch (error) {
      console.error(`❌ Erro ao remover ${itemPath}:`, error.message)
      errorCount++
    }
  } else {
    console.log(`⚠️ Item não encontrado: ${itemPath}`)
  }
}

// Resumo final
console.log("\n===========================================")
console.log(`Processo concluído!`)
console.log(`${removedCount} itens foram removidos com sucesso.`)
if (errorCount > 0) {
  console.log(`${errorCount} erros ocorreram durante o processo.`)
}
console.log("===========================================")
