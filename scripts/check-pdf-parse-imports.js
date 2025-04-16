// Script para verificar se pdf-parse está sendo importado em arquivos do cliente
const fs = require("fs")
const path = require("path")

console.log("Verificando importações de pdf-parse em arquivos do cliente...")

// Função para encontrar arquivos recursivamente
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

// Encontrar todos os arquivos JavaScript, TypeScript e React
const jsFiles = findFiles(".", /\.(js|jsx|ts|tsx)$/)

// Verificar cada arquivo por importações de pdf-parse
const clientDirs = ["app", "components", "hooks", "lib", "utils"]
const serverDirs = ["api", "server"]

let foundImports = false

jsFiles.forEach((filePath) => {
  // Verificar se é um arquivo do cliente
  const isClientFile =
    clientDirs.some((dir) => filePath.includes(`/${dir}/`)) &&
    !serverDirs.some((dir) => filePath.includes(`/${dir}/`)) &&
    !filePath.includes("/api/")

  if (isClientFile) {
    const content = fs.readFileSync(filePath, "utf8")

    // Verificar importações de pdf-parse
    if (content.includes("pdf-parse") || content.includes("pdfParse")) {
      console.log(`⚠️ Encontrada importação de pdf-parse em arquivo do cliente: ${filePath}`)
      foundImports = true
    }
  }
})

if (!foundImports) {
  console.log("✅ Nenhuma importação de pdf-parse encontrada em arquivos do cliente.")
}
