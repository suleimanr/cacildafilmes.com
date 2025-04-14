// Script para limpar referências ao ElevenLabs em arquivos de configuração
const fs = require("fs")
const path = require("path")

// Lista de arquivos de configuração a serem verificados
const configFiles = [
  "next.config.mjs",
  "next.config.js",
  ".babelrc",
  ".babelrc.js",
  "babel.config.js",
  "tsconfig.json",
  "tsconfig.server.json",
  "package.json",
  "vercel.json",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.example",
  ".npmrc",
]

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

console.log("Verificando arquivos de configuração...")

// Verificar cada arquivo de configuração
for (const configFile of configFiles) {
  if (fs.existsSync(configFile)) {
    console.log(`Verificando: ${configFile}`)

    try {
      let content = fs.readFileSync(configFile, "utf8")
      const originalContent = content

      // Verificar se o arquivo contém referências ao ElevenLabs
      const hasReferences = searchTerms.some((term) => content.includes(term))

      if (hasReferences) {
        console.log(`Encontradas referências ao ElevenLabs em: ${configFile}`)

        // Processar o arquivo com base em seu tipo
        if (configFile.endsWith(".json")) {
          // Arquivos JSON
          try {
            const jsonData = JSON.parse(content)

            // Processar package.json
            if (configFile === "package.json") {
              // Remover dependências relacionadas ao ElevenLabs
              if (jsonData.dependencies) {
                Object.keys(jsonData.dependencies).forEach((dep) => {
                  if (searchTerms.some((term) => dep.toLowerCase().includes(term.toLowerCase()))) {
                    console.log(`Removendo dependência: ${dep}`)
                    delete jsonData.dependencies[dep]
                  }
                })
              }

              // Remover devDependencies relacionadas ao ElevenLabs
              if (jsonData.devDependencies) {
                Object.keys(jsonData.devDependencies).forEach((dep) => {
                  if (searchTerms.some((term) => dep.toLowerCase().includes(term.toLowerCase()))) {
                    console.log(`Removendo devDependência: ${dep}`)
                    delete jsonData.devDependencies[dep]
                  }
                })
              }

              // Adicionar script para limpar referências ao ElevenLabs
              if (!jsonData.scripts) {
                jsonData.scripts = {}
              }

              jsonData.scripts.prebuild = "node scripts/purge-elevenlabs.js"
              jsonData.scripts["clean-elevenlabs"] = "node scripts/purge-elevenlabs.js"
            }

            // Processar tsconfig.json
            if (configFile.includes("tsconfig")) {
              // Adicionar padrões de exclusão para arquivos relacionados ao ElevenLabs
              if (!jsonData.exclude) {
                jsonData.exclude = []
              }

              const excludePatterns = [
                "node_modules",
                "**/elevenlabs*",
                "**/11labs*",
                "**/*elevenlabs*",
                "**/*11labs*",
                "**/ElevenLabs*",
                "**/eleven-labs*",
                "**/Elevenlabs*",
              ]

              for (const pattern of excludePatterns) {
                if (!jsonData.exclude.includes(pattern)) {
                  jsonData.exclude.push(pattern)
                }
              }
            }

            // Processar vercel.json
            if (configFile === "vercel.json") {
              // Atualizar buildCommand para incluir a limpeza do ElevenLabs
              if (jsonData.buildCommand) {
                if (!jsonData.buildCommand.includes("purge-elevenlabs")) {
                  jsonData.buildCommand = `node scripts/purge-elevenlabs.js && ${jsonData.buildCommand}`
                }
              } else {
                jsonData.buildCommand = "node scripts/purge-elevenlabs.js && next build"
              }
            }

            // Salvar o arquivo JSON atualizado
            content = JSON.stringify(jsonData, null, 2)
          } catch (jsonError) {
            console.error(`Erro ao processar JSON em ${configFile}:`, jsonError.message)
          }
        } else if (configFile.startsWith(".env")) {
          // Arquivos .env
          // Comentar linhas com variáveis do ElevenLabs
          content = content.replace(/^(ELEVENLABS_.*=.*)$/gm, "# $1 (removed)")
          content = content.replace(/^(NEXT_PUBLIC_ELEVENLABS_.*=.*)$/gm, "# $1 (removed)")

          // Adicionar variáveis vazias para garantir que não sejam usadas
          if (!content.includes("ELEVENLABS_API_KEY=")) {
            content += "\n# ElevenLabs variables explicitly set to empty\nELEVENLABS_API_KEY=\n"
          }
          if (!content.includes("NEXT_PUBLIC_ELEVENLABS_API_KEY=")) {
            content += "NEXT_PUBLIC_ELEVENLABS_API_KEY=\n"
          }
          if (!content.includes("NEXT_PUBLIC_ELEVENLABS_AGENT_ID=")) {
            content += "NEXT_PUBLIC_ELEVENLABS_AGENT_ID=\n"
          }
          if (!content.includes("ELEVENLABS_WEBHOOK_SECRET=")) {
            content += "ELEVENLABS_WEBHOOK_SECRET=\n"
          }
        } else if (configFile.endsWith(".js") || configFile.endsWith(".mjs")) {
          // Arquivos JavaScript
          // Remover importações relacionadas ao ElevenLabs
          content = content.replace(/import\s+.*['"]elevenlabs.*['"]/g, "// Removed elevenlabs import")
          content = content.replace(/import\s+.*['"]@elevenlabs\/.*['"]/g, "// Removed elevenlabs import")
          content = content.replace(/require\s*$$\s*['"]elevenlabs.*['"]\s*$$/g, "{}")
          content = content.replace(/require\s*$$\s*['"]@elevenlabs\/.*['"]\s*$$/g, "{}")

          // Remover referências a objetos e propriedades
          content = content.replace(/11labs\s*:/g, "removed_elevenlabs:")
          content = content.replace(/elevenlabs\s*:/g, "removed_elevenlabs:")
          content = content.replace(/ElevenLabs/g, "RemovedElevenLabs")
          content = content.replace(/Elevenlabs/g, "RemovedElevenLabs")
          content = content.replace(/elevenlabs/g, "removed_elevenlabs")
        }

        // Verificar se o conteúdo foi modificado
        if (content !== originalContent) {
          fs.writeFileSync(configFile, content, "utf8")
          console.log(`✅ Arquivo atualizado: ${configFile}`)
        } else {
          console.log(`⚠️ Não foi possível remover automaticamente as referências em: ${configFile}`)
        }
      } else {
        console.log(`✅ Nenhuma referência encontrada em: ${configFile}`)
      }
    } catch (error) {
      console.error(`Erro ao processar ${configFile}:`, error.message)
    }
  }
}

console.log("\nVerificação de arquivos de configuração concluída!")
