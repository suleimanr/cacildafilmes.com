// Script para remover TODAS as referências ao ElevenLabs do código
const fs = require("fs")
const path = require("path")

// Função para encontrar todos os arquivos com extensões específicas
function findFiles(dir, extensions) {
  let results = []

  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`)
    return results
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)

    // Pular diretórios node_modules, .next, .git
    if (itemPath.includes("node_modules") || itemPath.includes(".next") || itemPath.includes(".git")) {
      continue
    }

    try {
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        results = results.concat(findFiles(itemPath, extensions))
      } else if (stat.isFile() && extensions.includes(path.extname(itemPath).toLowerCase())) {
        results.push(itemPath)
      }
    } catch (error) {
      console.error(`Erro ao acessar ${itemPath}:`, error.message)
    }
  }

  return results
}

// Função para remover TODAS as referências ao ElevenLabs de um arquivo
function cleanFile(filePath) {
  try {
    console.log(`Processando: ${filePath}`)
    let content = fs.readFileSync(filePath, "utf8")
    const originalContent = content

    // Lista completa de padrões para encontrar e substituir
    const patterns = [
      // Importações
      { regex: /import.*['"]elevenlabs.*['"]/g, replacement: "// Removed elevenlabs import" },
      { regex: /import.*['"]@elevenlabs\/.*['"]/g, replacement: "// Removed elevenlabs import" },
      { regex: /require\s*$$\s*['"]elevenlabs.*['"]\s*$$/g, replacement: "{}" },
      { regex: /require\s*$$\s*['"]@elevenlabs\/.*['"]\s*$$/g, replacement: "{}" },

      // Referências a objetos e propriedades
      { regex: /11labs\s*:/g, replacement: "elevenlabs_removed:" },
      { regex: /elevenlabs\s*:/g, replacement: "elevenlabs_removed:" },
      { regex: /ElevenLabs/g, replacement: "ElevenlabsRemoved" },
      { regex: /Elevenlabs/g, replacement: "ElevenlabsRemoved" },
      { regex: /elevenlabs/g, replacement: "elevenlabs_removed" },

      // Variáveis de ambiente
      { regex: /ELEVENLABS_/g, replacement: "ELEVENLABS_REMOVED_" },
      { regex: /NEXT_PUBLIC_ELEVENLABS_/g, replacement: "NEXT_PUBLIC_ELEVENLABS_REMOVED_" },

      // Componentes específicos
      { regex: /<ElevenLabs.*?>/g, replacement: "{/* ElevenLabs component removed */}" },
      { regex: /<\/ElevenLabs.*?>/g, replacement: "{/* /ElevenLabs component removed */}" },

      // Comentários que mencionam ElevenLabs (para ser completo)
      { regex: /\/\/.*elevenlabs.*/gi, replacement: "// elevenlabs reference removed" },
      { regex: /\/\*.*elevenlabs.*\*\//gi, replacement: "/* elevenlabs reference removed */" },

      // Blocos de código relacionados ao ElevenLabs
      { regex: /const\s+elevenlabs.*?;/gs, replacement: "// elevenlabs code removed;" },
      { regex: /const\s+ElevenLabs.*?;/gs, replacement: "// elevenlabs code removed;" },
      { regex: /function.*elevenlabs.*?\{.*?\}/gs, replacement: "// elevenlabs function removed" },
      { regex: /function.*ElevenLabs.*?\{.*?\}/gs, replacement: "// elevenlabs function removed" },

      // Números seguidos por "labs" (como em "11labs")
      { regex: /(\d+)labs/g, replacement: "$1_labs_removed" },
    ]

    // Aplicar cada padrão
    for (const pattern of patterns) {
      content = content.replace(pattern.regex, pattern.replacement)
    }

    // Verificar se o conteúdo foi modificado
    if (content !== originalContent) {
      console.log(`  Modificado: ${filePath}`)
      fs.writeFileSync(filePath, content, "utf8")
    }
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message)
  }
}

// Extensões de arquivo a serem processadas
const extensions = [".js", ".jsx", ".ts", ".tsx", ".json", ".mjs", ".cjs", ".md", ".mdx", ".html", ".css"]

// Encontrar e processar todos os arquivos
console.log("Buscando arquivos...")
const files = findFiles(".", extensions)
console.log(`Encontrados ${files.length} arquivos para processar.`)

// Processar cada arquivo
let modifiedCount = 0
for (const file of files) {
  const originalContent = fs.readFileSync(file, "utf8")
  cleanFile(file)
  const newContent = fs.readFileSync(file, "utf8")

  if (originalContent !== newContent) {
    modifiedCount++
  }
}

console.log(`Processamento concluído! ${modifiedCount} arquivos foram modificados.`)

// Verificar se ainda existem referências ao ElevenLabs
console.log("Verificando se ainda existem referências ao ElevenLabs...")
let foundReferences = false

for (const file of files) {
  const content = fs.readFileSync(file, "utf8")

  // Padrões para verificar
  const checkPatterns = [/elevenlabs/i, /11labs/i, /ElevenLabs/i, /ELEVENLABS_/]

  for (const pattern of checkPatterns) {
    if (pattern.test(content)) {
      console.log(`Referência encontrada em: ${file}`)
      foundReferences = true
      break
    }
  }
}

if (!foundReferences) {
  console.log("Nenhuma referência ao ElevenLabs encontrada!")
} else {
  console.log("Ainda existem referências ao ElevenLabs. Verifique os arquivos listados acima.")
}
