// Script para corrigir o problema específico de "11labs" no código
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Função para encontrar todos os arquivos no projeto
function findAllFiles(dir, excludeDirs = ["node_modules", ".git", "dist"]) {
  let results = []

  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`)
    return results
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)

    // Pular diretórios excluídos
    if (excludeDirs.some((excludeDir) => itemPath.includes(excludeDir))) {
      continue
    }

    try {
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        results = results.concat(findAllFiles(itemPath, excludeDirs))
      } else if (stat.isFile()) {
        results.push(itemPath)
      }
    } catch (error) {
      console.error(`Erro ao acessar ${itemPath}:`, error.message)
    }
  }

  return results
}

// Padrões específicos para corrigir o problema de "11labs"
const patterns = [
  // Corrigir o problema de "11labs: ["
  { regex: /(\d+)labs\s*:/g, replacement: "'$1labs':" },
  { regex: /11labs\s*:/g, replacement: "'11labs':" },
  { regex: /elevenlabs\s*:/g, replacement: "'elevenlabs':" },
  { regex: /ElevenLabs\s*:/g, replacement: "'ElevenLabs':" },

  // Remover completamente blocos relacionados ao 11labs
  { regex: /['"]?11labs['"]?\s*:\s*\[\s*['"]__DEFAULT__['"]?,\s*\{\},?.*?\],?/gs, replacement: "" },
  { regex: /['"]?elevenlabs['"]?\s*:\s*\[\s*['"]__DEFAULT__['"]?,\s*\{\},?.*?\],?/gs, replacement: "" },

  // Remover importações relacionadas ao 11labs
  { regex: /import\s+.*?['"].*?11labs.*?['"]/g, replacement: "// Removed 11labs import" },
  { regex: /import\s+.*?['"].*?elevenlabs.*?['"]/g, replacement: "// Removed elevenlabs import" },

  // Remover referências a arquivos 11labs
  { regex: /['"]\.\/app\/@11labs\/.*?['"]/g, replacement: "''" },
  { regex: /['"]\.\/app\/@elevenlabs\/.*?['"]/g, replacement: "''" },
]

// Encontrar todos os arquivos
console.log("Buscando todos os arquivos no projeto...")
const allFiles = findAllFiles(".")
console.log(`Encontrados ${allFiles.length} arquivos para processar.`)

// Processar cada arquivo
let modifiedCount = 0
let errorCount = 0

for (const file of allFiles) {
  try {
    // Pular arquivos binários ou muito grandes
    const stat = fs.statSync(file)
    if (stat.size > 10 * 1024 * 1024) {
      // Pular arquivos maiores que 10MB
      console.log(`Pulando arquivo grande: ${file} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`)
      continue
    }

    // Ler o conteúdo do arquivo
    let content
    try {
      content = fs.readFileSync(file, "utf8")
      const originalContent = content

      // Aplicar cada padrão de substituição
      for (const pattern of patterns) {
        content = content.replace(pattern.regex, pattern.replacement)
      }

      // Verificar se o conteúdo foi modificado
      if (content !== originalContent) {
        fs.writeFileSync(file, content, "utf8")
        console.log(`Modificado: ${file}`)
        modifiedCount++
      }
    } catch (readError) {
      console.log(`Não foi possível ler o arquivo como texto: ${file}`)
      continue
    }
  } catch (error) {
    console.error(`Erro ao processar ${file}:`, error.message)
    errorCount++
  }
}

// Verificar e corrigir especificamente o next.config.js ou next.config.mjs
const nextConfigFiles = ["next.config.js", "next.config.mjs"]
for (const configFile of nextConfigFiles) {
  if (fs.existsSync(configFile)) {
    console.log(`\nVerificando e corrigindo ${configFile}...`)
    try {
      let content = fs.readFileSync(configFile, "utf8")
      const originalContent = content

      // Remover completamente qualquer configuração relacionada ao 11labs ou elevenlabs
      content = content.replace(/11labs\s*:.*?,/g, "")
      content = content.replace(/elevenlabs\s*:.*?,/g, "")
      content = content.replace(/ElevenLabs\s*:.*?,/g, "")

      // Corrigir a configuração experimental.serverComponentsExternalPackages
      content = content.replace(/serverComponentsExternalPackages/g, "serverExternalPackages")

      // Verificar se o conteúdo foi modificado
      if (content !== originalContent) {
        fs.writeFileSync(configFile, content, "utf8")
        console.log(`Modificado: ${configFile}`)
        modifiedCount++
      }
    } catch (error) {
      console.error(`Erro ao processar ${configFile}:`, error.message)
      errorCount++
    }
  }
}

// Verificar e corrigir especificamente os arquivos na pasta .next
if (fs.existsSync(".next")) {
  console.log("\nVerificando arquivos na pasta .next...")
  try {
    // Remover a pasta .next completamente para forçar uma reconstrução limpa
    console.log("Removendo a pasta .next para forçar uma reconstrução limpa...")
    fs.rmSync(".next", { recursive: true, force: true })
    console.log("Pasta .next removida com sucesso.")
  } catch (error) {
    console.error("Erro ao remover a pasta .next:", error.message)
    errorCount++
  }
}

// Verificar e remover arquivos específicos que podem estar causando problemas
const problematicFiles = [
  "app/@11labs",
  "app/@elevenlabs",
  "components/@11labs",
  "lib/elevenlabs-config.ts",
  "lib/elevenlabs-service.ts",
  "types/elevenlabs.ts",
]

console.log("\nVerificando e removendo arquivos problemáticos...")
for (const filePath of problematicFiles) {
  if (fs.existsSync(filePath)) {
    try {
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        console.log(`Removendo diretório: ${filePath}`)
        fs.rmSync(filePath, { recursive: true, force: true })
      } else {
        console.log(`Removendo arquivo: ${filePath}`)
        fs.unlinkSync(filePath)
      }
      console.log(`Removido com sucesso: ${filePath}`)
      modifiedCount++
    } catch (error) {
      console.error(`Erro ao remover ${filePath}:`, error.message)
      errorCount++
    }
  }
}

// Resumo final
console.log("\n===========================================")
console.log(`Processo concluído!`)
console.log(`${modifiedCount} arquivos foram modificados ou excluídos.`)
if (errorCount > 0) {
  console.log(`${errorCount} erros ocorreram durante o processo.`)
}
console.log("===========================================")
