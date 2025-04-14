// Script para limpar referências ao ElevenLabs
const fs = require("fs")
const path = require("path")

// Função para procurar arquivos recursivamente
function findFiles(dir, pattern) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !filePath.includes("node_modules") && !filePath.includes(".next")) {
      // Recursivamente procurar em subdiretórios
      results = results.concat(findFiles(filePath, pattern))
    } else if (pattern.test(file)) {
      // Adicionar arquivo que corresponde ao padrão
      results.push(filePath)
    }
  })

  return results
}

// Função para limpar referências ao ElevenLabs em um arquivo
function cleanElevenLabsReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")

    // Padrões para encontrar referências ao ElevenLabs
    const patterns = [
      /import.*['"](elevenlabs|@elevenlabs\/elevenlabs-react)['"]/g,
      /require$$['"](elevenlabs|@elevenlabs\/elevenlabs-react)['"]$$/g,
      /11labs:/g,
      /elevenlabs/gi,
      /ElevenLabs/g,
      /ELEVENLABS/g,
    ]

    // Substituir cada padrão
    patterns.forEach((pattern) => {
      content = content.replace(pattern, "// REMOVED_ELEVENLABS")
    })

    // Escrever o conteúdo modificado de volta ao arquivo
    fs.writeFileSync(filePath, content, "utf8")
    console.log(`Cleaned: ${filePath}`)
  } catch (error) {
    console.error(`Error cleaning ${filePath}:`, error)
  }
}

// Encontrar todos os arquivos JavaScript, TypeScript e JSON
const jsFiles = findFiles(".", /\.(js|jsx|ts|tsx|json|mjs)$/)

// Limpar referências ao ElevenLabs em cada arquivo
jsFiles.forEach(cleanElevenLabsReferences)

console.log("Finished cleaning ElevenLabs references")
