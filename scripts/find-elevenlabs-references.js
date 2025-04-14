// Script para encontrar TODAS as referências ao ElevenLabs em todos os arquivos
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

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

// Termos a serem procurados
const searchTerms = [
  "elevenlabs",
  "ElevenLabs",
  "Elevenlabs",
  "ELEVENLABS",
  "eleven-labs",
  "11labs",
  "11Labs",
  "NEXT_PUBLIC_ELEVENLABS",
  "ELEVENLABS_",
]

// Encontrar todos os arquivos
console.log("Buscando todos os arquivos no projeto...")
const allFiles = findAllFiles(".")
console.log(`Encontrados ${allFiles.length} arquivos para verificar.`)

// Verificar cada arquivo
let foundReferences = false
const referencesFound = []

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
    } catch (readError) {
      console.log(`Não foi possível ler o arquivo como texto: ${file}`)
      continue
    }

    // Verificar cada termo
    for (const term of searchTerms) {
      if (content.includes(term)) {
        foundReferences = true
        referencesFound.push({ file, term })
        break // Encontrou um termo, não precisa verificar os outros
      }
    }
  } catch (error) {
    console.error(`Erro ao processar ${file}:`, error.message)
  }
}

// Exibir resultados
if (foundReferences) {
  console.log("\n🚨 REFERÊNCIAS AO ELEVENLABS ENCONTRADAS:")
  console.log("===========================================")

  const fileGroups = {}

  referencesFound.forEach(({ file, term }) => {
    if (!fileGroups[file]) {
      fileGroups[file] = []
    }
    if (!fileGroups[file].includes(term)) {
      fileGroups[file].push(term)
    }
  })

  Object.entries(fileGroups).forEach(([file, terms]) => {
    console.log(`\nArquivo: ${file}`)
    console.log(`Termos encontrados: ${terms.join(", ")}`)
  })

  console.log("\n===========================================")
  console.log(`Total: ${Object.keys(fileGroups).length} arquivos contêm referências ao ElevenLabs.`)
} else {
  console.log("\n✅ NENHUMA REFERÊNCIA AO ELEVENLABS ENCONTRADA!")
}

// Verificar se há arquivos com nomes relacionados ao ElevenLabs
console.log("\nVerificando arquivos com nomes relacionados ao ElevenLabs...")
const elevenlabsFiles = allFiles.filter((file) => {
  const fileName = path.basename(file).toLowerCase()
  return searchTerms.some((term) => fileName.includes(term.toLowerCase()))
})

if (elevenlabsFiles.length > 0) {
  console.log("\n🚨 ARQUIVOS COM NOMES RELACIONADOS AO ELEVENLABS:")
  console.log("===========================================")
  elevenlabsFiles.forEach((file) => console.log(file))
  console.log("\n===========================================")
  console.log(`Total: ${elevenlabsFiles.length} arquivos têm nomes relacionados ao ElevenLabs.`)
} else {
  console.log("✅ Nenhum arquivo com nome relacionado ao ElevenLabs encontrado!")
}

// Verificar se há diretórios com nomes relacionados ao ElevenLabs
console.log("\nVerificando diretórios com nomes relacionados ao ElevenLabs...")
try {
  // Usar o comando find para localizar diretórios (funciona em Linux/Mac)
  const findCommand = "find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*'"
  const directories = execSync(findCommand).toString().split("\n").filter(Boolean)

  const elevenlabsDirs = directories.filter((dir) => {
    const dirName = path.basename(dir).toLowerCase()
    return searchTerms.some((term) => dirName.includes(term.toLowerCase()))
  })

  if (elevenlabsDirs.length > 0) {
    console.log("\n🚨 DIRETÓRIOS COM NOMES RELACIONADOS AO ELEVENLABS:")
    console.log("===========================================")
    elevenlabsDirs.forEach((dir) => console.log(dir))
    console.log("\n===========================================")
    console.log(`Total: ${elevenlabsDirs.length} diretórios têm nomes relacionados ao ElevenLabs.`)
  } else {
    console.log("✅ Nenhum diretório com nome relacionado ao ElevenLabs encontrado!")
  }
} catch (error) {
  console.log("Não foi possível verificar diretórios usando o comando find.")
  console.log("Isso é normal em ambientes Windows ou onde o comando find não está disponível.")
}

// Resumo final
if (foundReferences || elevenlabsFiles.length > 0) {
  console.log("\n🚨 ATENÇÃO: Ainda existem referências ao ElevenLabs no projeto!")
  process.exit(1) // Sair com código de erro
} else {
  console.log("\n✅ SUCESSO: Nenhuma referência ao ElevenLabs encontrada no projeto!")
  process.exit(0) // Sair com sucesso
}
