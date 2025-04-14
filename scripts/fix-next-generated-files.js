// Script para corrigir o problema específico nos arquivos gerados pelo Next.js
const fs = require("fs")
const path = require("path")

// Função para encontrar todos os arquivos em um diretório
function findAllFiles(dir, pattern) {
  let results = []

  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`)
    return results
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)

    try {
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        results = results.concat(findAllFiles(itemPath, pattern))
      } else if (stat.isFile() && pattern.test(item)) {
        results.push(itemPath)
      }
    } catch (error) {
      console.error(`Erro ao acessar ${itemPath}:`, error.message)
    }
  }

  return results
}

// Diretórios a serem verificados
const dirsToCheck = [path.join(process.cwd(), ".next"), path.join(process.cwd(), "node_modules", ".cache")]

console.log("Verificando arquivos gerados pelo Next.js...")

let modifiedCount = 0
let errorCount = 0

for (const dir of dirsToCheck) {
  if (fs.existsSync(dir)) {
    console.log(`Verificando diretório: ${dir}`)

    // Encontrar arquivos JavaScript e JSON
    const files = findAllFiles(dir, /\.(js|json)$/)
    console.log(`Encontrados ${files.length} arquivos para verificar.`)

    for (const file of files) {
      try {
        let content = fs.readFileSync(file, "utf8")
        const originalContent = content

        // Corrigir o problema de "11labs: ["
        content = content.replace(/(\d+)labs\s*:/g, "'$1labs':")
        content = content.replace(/11labs\s*:/g, "'11labs':")
        content = content.replace(/elevenlabs\s*:/g, "'elevenlabs':")

        // Remover completamente blocos relacionados ao 11labs
        content = content.replace(/['"]?11labs['"]?\s*:\s*\[\s*['"]__DEFAULT__['"]?,\s*\{\},?.*?\],?/gs, "")
        content = content.replace(/['"]?elevenlabs['"]?\s*:\s*\[\s*['"]__DEFAULT__['"]?,\s*\{\},?.*?\],?/gs, "")

        // Verificar se o conteúdo foi modificado
        if (content !== originalContent) {
          fs.writeFileSync(file, content, "utf8")
          console.log(`Modificado: ${file}`)
          modifiedCount++
        }
      } catch (error) {
        console.error(`Erro ao processar ${file}:`, error.message)
        errorCount++
      }
    }
  } else {
    console.log(`Diretório não encontrado: ${dir}`)
  }
}

// Resumo final
console.log("\n===========================================")
console.log(`Processo concluído!`)
console.log(`${modifiedCount} arquivos foram modificados.`)
if (errorCount > 0) {
  console.log(`${errorCount} erros ocorreram durante o processo.`)
}
console.log("===========================================")
