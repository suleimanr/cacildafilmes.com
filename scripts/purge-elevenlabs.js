// Script para remover COMPLETAMENTE todas as referências ao ElevenLabs
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

// Padrões para encontrar e substituir
const replacementPatterns = [
  // Importações
  { regex: /import\s+.*['"]elevenlabs.*['"]/g, replacement: "// Removed elevenlabs import" },
  { regex: /import\s+.*['"]@elevenlabs\/.*['"]/g, replacement: "// Removed elevenlabs import" },
  { regex: /require\s*$$\s*['"]elevenlabs.*['"]\s*$$/g, replacement: "{}" },
  { regex: /require\s*$$\s*['"]@elevenlabs\/.*['"]\s*$$/g, replacement: "{}" },

  // Referências a objetos e propriedades
  { regex: /11labs\s*:/g, replacement: "removed_elevenlabs:" },
  { regex: /elevenlabs\s*:/g, replacement: "removed_elevenlabs:" },
  { regex: /ElevenLabs/g, replacement: "RemovedElevenLabs" },
  { regex: /Elevenlabs/g, replacement: "RemovedElevenLabs" },
  { regex: /elevenlabs/g, replacement: "removed_elevenlabs" },

  // Variáveis de ambiente
  { regex: /ELEVENLABS_/g, replacement: "REMOVED_ELEVENLABS_" },
  { regex: /NEXT_PUBLIC_ELEVENLABS_/g, replacement: "REMOVED_NEXT_PUBLIC_ELEVENLABS_" },

  // Componentes específicos
  { regex: /<ElevenLabs.*?>/g, replacement: "{/* ElevenLabs component removed */}" },
  { regex: /<\/ElevenLabs.*?>/g, replacement: "{/* /ElevenLabs component removed */}" },

  // Comentários que mencionam ElevenLabs
  { regex: /\/\/.*elevenlabs.*/gi, replacement: "// elevenlabs reference removed" },
  { regex: /\/\*.*elevenlabs.*\*\//gi, replacement: "/* elevenlabs reference removed */" },

  // Blocos de código relacionados ao ElevenLabs
  { regex: /const\s+elevenlabs.*?;/gs, replacement: "// elevenlabs code removed;" },
  { regex: /const\s+ElevenLabs.*?;/gs, replacement: "// elevenlabs code removed;" },
  { regex: /function.*elevenlabs.*?\{.*?\}/gs, replacement: "// elevenlabs function removed" },
  { regex: /function.*ElevenLabs.*?\{.*?\}/gs, replacement: "// elevenlabs function removed" },

  // Números seguidos por "labs" (como em "11labs")
  { regex: /(\d+)labs/g, replacement: "$1_labs_removed" },

  // Variáveis e funções específicas
  { regex: /useElevenLabs/g, replacement: "useRemovedElevenLabs" },
  { regex: /initElevenLabs/g, replacement: "initRemovedElevenLabs" },
  { regex: /elevenLabsConfig/g, replacement: "removedElevenLabsConfig" },

  // Importações dinâmicas
  { regex: /import\s*$$\s*['"]elevenlabs.*['"]\s*$$/g, replacement: "Promise.resolve({})" },
  { regex: /import\s*$$\s*['"]@elevenlabs\/.*['"]\s*$$/g, replacement: "Promise.resolve({})" },

  // Referências em JSX
  { regex: /elevenlabs={.*?}/g, replacement: "removed_elevenlabs={{}}" },
  { regex: /ElevenLabs={.*?}/g, replacement: "RemovedElevenLabs={{}}" },

  // Referências em URLs
  { regex: /elevenlabs\.io/g, replacement: "removed-elevenlabs.example" },
  { regex: /elevenlabs\.com/g, replacement: "removed-elevenlabs.example" },

  // Referências em strings de template
  { regex: /`.*elevenlabs.*`/gi, replacement: "`elevenlabs reference removed`" },

  // Referências em strings
  { regex: /".*elevenlabs.*"/gi, replacement: '"elevenlabs reference removed"' },
  { regex: /'.*elevenlabs.*'/gi, replacement: "'elevenlabs reference removed'" },
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
      for (const pattern of replacementPatterns) {
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

// Encontrar e excluir arquivos com nomes relacionados ao ElevenLabs
console.log("\nProcurando arquivos com nomes relacionados ao ElevenLabs...")
const searchTerms = ["elevenlabs", "eleven-labs", "11labs"]
const elevenlabsFiles = allFiles.filter((file) => {
  const fileName = path.basename(file).toLowerCase()
  return searchTerms.some((term) => fileName.includes(term.toLowerCase()))
})

if (elevenlabsFiles.length > 0) {
  console.log(`Encontrados ${elevenlabsFiles.length} arquivos com nomes relacionados ao ElevenLabs.`)

  for (const file of elevenlabsFiles) {
    try {
      fs.unlinkSync(file)
      console.log(`Excluído: ${file}`)
      modifiedCount++
    } catch (error) {
      console.error(`Erro ao excluir ${file}:`, error.message)
      errorCount++
    }
  }
} else {
  console.log("Nenhum arquivo com nome relacionado ao ElevenLabs encontrado.")
}

// Limpar variáveis de ambiente relacionadas ao ElevenLabs
console.log("\nLimpando variáveis de ambiente relacionadas ao ElevenLabs...")
const envFiles = [".env", ".env.local", ".env.development", ".env.production", ".env.example"]

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    try {
      let envContent = fs.readFileSync(envFile, "utf8")
      const originalEnvContent = envContent

      // Remover ou comentar linhas com variáveis do ElevenLabs
      envContent = envContent.replace(/^(ELEVENLABS_.*=.*)$/gm, "# $1 (removed)")
      envContent = envContent.replace(/^(NEXT_PUBLIC_ELEVENLABS_.*=.*)$/gm, "# $1 (removed)")

      // Adicionar variáveis vazias para garantir que não sejam usadas
      if (!envContent.includes("ELEVENLABS_API_KEY=")) {
        envContent += "\n# ElevenLabs variables explicitly set to empty\nELEVENLABS_API_KEY=\n"
      }
      if (!envContent.includes("NEXT_PUBLIC_ELEVENLABS_API_KEY=")) {
        envContent += "NEXT_PUBLIC_ELEVENLABS_API_KEY=\n"
      }
      if (!envContent.includes("NEXT_PUBLIC_ELEVENLABS_AGENT_ID=")) {
        envContent += "NEXT_PUBLIC_ELEVENLABS_AGENT_ID=\n"
      }
      if (!envContent.includes("ELEVENLABS_WEBHOOK_SECRET=")) {
        envContent += "ELEVENLABS_WEBHOOK_SECRET=\n"
      }

      // Verificar se o conteúdo foi modificado
      if (envContent !== originalEnvContent) {
        fs.writeFileSync(envFile, envContent, "utf8")
        console.log(`Modificado: ${envFile}`)
        modifiedCount++
      }
    } catch (error) {
      console.error(`Erro ao processar ${envFile}:`, error.message)
      errorCount++
    }
  }
}

// Atualizar arquivos de configuração para excluir arquivos relacionados ao ElevenLabs
console.log("\nAtualizando arquivos de configuração...")

// Atualizar tsconfig.json
if (fs.existsSync("tsconfig.json")) {
  try {
    const tsconfigContent = fs.readFileSync("tsconfig.json", "utf8")
    const tsconfig = JSON.parse(tsconfigContent)

    // Adicionar padrões de exclusão para arquivos relacionados ao ElevenLabs
    if (!tsconfig.exclude) {
      tsconfig.exclude = []
    }

    const excludePatterns = [
      "node_modules",
      "**/elevenlabs*",
      "**/11labs*",
      "**/*elevenlabs*",
      "**/*11labs*",
      "**/ElevenLabs*",
      "**/eleven-labs*",
    ]

    for (const pattern of excludePatterns) {
      if (!tsconfig.exclude.includes(pattern)) {
        tsconfig.exclude.push(pattern)
      }
    }

    fs.writeFileSync("tsconfig.json", JSON.stringify(tsconfig, null, 2), "utf8")
    console.log("Modificado: tsconfig.json")
    modifiedCount++
  } catch (error) {
    console.error("Erro ao atualizar tsconfig.json:", error.message)
    errorCount++
  }
}

// Atualizar package.json para adicionar scripts de limpeza
if (fs.existsSync("package.json")) {
  try {
    const packageContent = fs.readFileSync("package.json", "utf8")
    const packageJson = JSON.parse(packageContent)

    // Adicionar scripts para limpar referências ao ElevenLabs
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    packageJson.scripts.prebuild = "node scripts/purge-elevenlabs.js"
    packageJson.scripts["clean-elevenlabs"] = "node scripts/purge-elevenlabs.js"

    // Remover dependências relacionadas ao ElevenLabs
    if (packageJson.dependencies) {
      const depsToRemove = Object.keys(packageJson.dependencies).filter(
        (dep) => dep.toLowerCase().includes("elevenlabs") || dep.toLowerCase().includes("11labs"),
      )

      for (const dep of depsToRemove) {
        delete packageJson.dependencies[dep]
        console.log(`Removida dependência: ${dep}`)
      }
    }

    if (packageJson.devDependencies) {
      const devDepsToRemove = Object.keys(packageJson.devDependencies).filter(
        (dep) => dep.toLowerCase().includes("elevenlabs") || dep.toLowerCase().includes("11labs"),
      )

      for (const dep of devDepsToRemove) {
        delete packageJson.devDependencies[dep]
        console.log(`Removida devDependência: ${dep}`)
      }
    }

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2), "utf8")
    console.log("Modificado: package.json")
    modifiedCount++
  } catch (error) {
    console.error("Erro ao atualizar package.json:", error.message)
    errorCount++
  }
}

// Atualizar vercel.json se existir
if (fs.existsSync("vercel.json")) {
  try {
    const vercelContent = fs.readFileSync("vercel.json", "utf8")
    const vercelJson = JSON.parse(vercelContent)

    // Atualizar buildCommand para incluir a limpeza do ElevenLabs
    if (vercelJson.buildCommand) {
      if (!vercelJson.buildCommand.includes("purge-elevenlabs")) {
        vercelJson.buildCommand = `node scripts/purge-elevenlabs.js && ${vercelJson.buildCommand}`
      }
    } else {
      vercelJson.buildCommand = "node scripts/purge-elevenlabs.js && next build"
    }

    fs.writeFileSync("vercel.json", JSON.stringify(vercelJson, null, 2), "utf8")
    console.log("Modificado: vercel.json")
    modifiedCount++
  } catch (error) {
    console.error("Erro ao atualizar vercel.json:", error.message)
    errorCount++
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

// Executar o script de verificação para confirmar que todas as referências foram removidas
console.log("\nVerificando se ainda existem referências ao ElevenLabs...")
try {
  require("./find-elevenlabs-references.js")
} catch (error) {
  console.error("Erro ao executar o script de verificação:", error.message)
  console.log("Execute manualmente: node scripts/find-elevenlabs-references.js")
}
