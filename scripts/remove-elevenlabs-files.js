// Script para encontrar e remover qualquer arquivo relacionado ao ElevenLabs
const fs = require("fs")
const path = require("path")

// Função para encontrar todos os arquivos no projeto
function findAllFiles(dir, excludeDirs = ["node_modules", ".next", ".git", "dist"]) {
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

// Termos a serem procurados nos nomes de arquivos
const searchTerms = ["elevenlabs", "ElevenLabs", "Elevenlabs", "eleven-labs", "11labs", "11Labs"]

// Encontrar todos os arquivos
console.log("Buscando todos os arquivos no projeto...")
const allFiles = findAllFiles(".")
console.log(`Encontrados ${allFiles.length} arquivos para verificar.`)

// Filtrar arquivos com nomes relacionados ao ElevenLabs
const elevenlabsFiles = allFiles.filter((file) => {
  const fileName = path.basename(file).toLowerCase()
  return searchTerms.some((term) => fileName.toLowerCase().includes(term.toLowerCase()))
})

// Exibir e remover arquivos encontrados
if (elevenlabsFiles.length > 0) {
  console.log(`\nEncontrados ${elevenlabsFiles.length} arquivos com nomes relacionados ao ElevenLabs:`)
  console.log("===========================================")

  for (const file of elevenlabsFiles) {
    console.log(`Removendo: ${file}`)
    try {
      fs.unlinkSync(file)
      console.log(`✅ Arquivo removido com sucesso: ${file}`)
    } catch (error) {
      console.error(`❌ Erro ao remover arquivo: ${file}`, error.message)
    }
  }

  console.log("\n===========================================")
  console.log(`Processo concluído. ${elevenlabsFiles.length} arquivos foram verificados para remoção.`)
} else {
  console.log("\n✅ Nenhum arquivo com nome relacionado ao ElevenLabs encontrado!")
}

// Verificar se há diretórios com nomes relacionados ao ElevenLabs
console.log("\nVerificando diretórios com nomes relacionados ao ElevenLabs...")

function findDirectories(dir, excludeDirs = ["node_modules", ".next", ".git", "dist"]) {
  let results = []

  if (!fs.existsSync(dir)) {
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
        // Verificar se o nome do diretório contém termos relacionados ao ElevenLabs
        const dirName = path.basename(itemPath).toLowerCase()
        if (searchTerms.some((term) => dirName.includes(term.toLowerCase()))) {
          results.push(itemPath)
        }

        // Continuar procurando em subdiretórios
        results = results.concat(findDirectories(itemPath, excludeDirs))
      }
    } catch (error) {
      console.error(`Erro ao acessar ${itemPath}:`, error.message)
    }
  }

  return results
}

const elevenlabsDirs = findDirectories(".")

if (elevenlabsDirs.length > 0) {
  console.log(`\nEncontrados ${elevenlabsDirs.length} diretórios com nomes relacionados ao ElevenLabs:`)
  console.log("===========================================")

  // Ordenar diretórios do mais profundo para o mais raso para evitar problemas de dependência
  elevenlabsDirs.sort((a, b) => {
    const depthA = a.split(path.sep).length
    const depthB = b.split(path.sep).length
    return depthB - depthA // Ordem decrescente
  })

  for (const dir of elevenlabsDirs) {
    console.log(`Removendo diretório: ${dir}`)
    try {
      // Verificar se o diretório está vazio
      const items = fs.readdirSync(dir)
      if (items.length > 0) {
        console.log(`⚠️ Diretório não está vazio, removendo conteúdo primeiro: ${dir}`)
        for (const item of items) {
          const itemPath = path.join(dir, item)
          try {
            const stat = fs.statSync(itemPath)
            if (stat.isFile()) {
              fs.unlinkSync(itemPath)
              console.log(`  ✅ Arquivo removido: ${itemPath}`)
            } else {
              console.log(`  ⚠️ Subdiretório encontrado, pulando: ${itemPath}`)
            }
          } catch (error) {
            console.error(`  ❌ Erro ao remover item: ${itemPath}`, error.message)
          }
        }
      }

      // Agora tenta remover o diretório
      fs.rmdirSync(dir)
      console.log(`✅ Diretório removido com sucesso: ${dir}`)
    } catch (error) {
      console.error(`❌ Erro ao remover diretório: ${dir}`, error.message)
    }
  }

  console.log("\n===========================================")
  console.log(`Processo concluído. ${elevenlabsDirs.length} diretórios foram verificados para remoção.`)
} else {
  console.log("✅ Nenhum diretório com nome relacionado ao ElevenLabs encontrado!")
}
