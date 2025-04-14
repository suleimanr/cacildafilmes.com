// Script para verificar especificamente o diretório app/api em busca de referências ao ElevenLabs
const fs = require("fs")
const path = require("path")

// Função para encontrar todos os arquivos no diretório app/api
function findApiFiles(dir = "app/api") {
  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`)
    return []
  }

  let results = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)

    try {
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        results = results.concat(findApiFiles(itemPath))
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

// Encontrar todos os arquivos na pasta app/api
console.log("Buscando arquivos na pasta app/api...")
const apiFiles = findApiFiles()
console.log(`Encontrados ${apiFiles.length} arquivos para verificar.`)

// Verificar cada arquivo
let foundReferences = false
const referencesFound = []

for (const file of apiFiles) {
  try {
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
  console.log("\n🚨 REFERÊNCIAS AO ELEVENLABS ENCONTRADAS EM API ROUTES:")
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
  console.log(`Total: ${Object.keys(fileGroups).length} arquivos de API contêm referências ao ElevenLabs.`)
} else {
  console.log("\n✅ NENHUMA REFERÊNCIA AO ELEVENLABS ENCONTRADA NAS ROTAS DE API!")
}

// Verificar se há arquivos com nomes relacionados ao ElevenLabs
console.log("\nVerificando arquivos de API com nomes relacionados ao ElevenLabs...")
const elevenlabsFiles = apiFiles.filter((file) => {
  const fileName = path.basename(file).toLowerCase()
  return searchTerms.some((term) => fileName.includes(term.toLowerCase()))
})

if (elevenlabsFiles.length > 0) {
  console.log("\n🚨 ARQUIVOS DE API COM NOMES RELACIONADOS AO ELEVENLABS:")
  console.log("===========================================")
  elevenlabsFiles.forEach((file) => console.log(file))
  console.log("\n===========================================")
  console.log(`Total: ${elevenlabsFiles.length} arquivos de API têm nomes relacionados ao ElevenLabs.`)
} else {
  console.log("✅ Nenhum arquivo de API com nome relacionado ao ElevenLabs encontrado!")
}

// Resumo final
if (foundReferences || elevenlabsFiles.length > 0) {
  console.log("\n🚨 ATENÇÃO: Ainda existem referências ao ElevenLabs nas rotas de API!")
  process.exit(1) // Sair com código de erro
} else {
  console.log("\n✅ SUCESSO: Nenhuma referência ao ElevenLabs encontrada nas rotas de API!")
  process.exit(0) // Sair com sucesso
}
