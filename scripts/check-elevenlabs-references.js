// Script para verificar se ainda existem referências ao ElevenLabs
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("VERIFICANDO SE AINDA EXISTEM REFERÊNCIAS AO ELEVENLABS")
console.log("==========================================================")

// Termos a serem procurados
const searchTerms = [
  "elevenlabs",
  "ElevenLabs",
  "Elevenlabs",
  "ELEVENLABS",
  "eleven-labs",
  "11labs",
  "11Labs",
  "@elevenlabs",
  "@11labs",
]

// Usar grep para encontrar referências (funciona em Linux/Mac)
let foundReferences = false
try {
  const grepPattern = searchTerms.join("\\|")
  const grepCommand = `grep -r -l '${grepPattern}' --include='*.{js,jsx,ts,tsx,json,md,mjs}' . --exclude-dir={node_modules,.git,.next}`

  console.log("Executando comando:", grepCommand)

  const grepResult = execSync(grepCommand, { encoding: "utf8" })
  const filesWithReferences = grepResult.split("\n").filter(Boolean)

  if (filesWithReferences.length > 0) {
    foundReferences = true
    console.log("\n🚨 AINDA EXISTEM REFERÊNCIAS AO ELEVENLABS NOS SEGUINTES ARQUIVOS:")
    filesWithReferences.forEach((file) => console.log(`- ${file}`))
  }
} catch (error) {
  if (error.status !== 1) {
    // grep retorna 1 quando não encontra nada, o que é bom neste caso
    console.log("Não foi possível usar grep, usando método alternativo...")

    // Método alternativo para Windows ou se grep falhar
    function findReferencesInFiles(dir, excludeDirs = ["node_modules", ".git", ".next"]) {
      let results = []

      if (!fs.existsSync(dir)) return results

      const items = fs.readdirSync(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)

        // Pular diretórios excluídos
        if (excludeDirs.some((excludeDir) => fullPath.includes(excludeDir))) {
          continue
        }

        try {
          const stat = fs.statSync(fullPath)

          if (stat.isDirectory()) {
            results = results.concat(findReferencesInFiles(fullPath, excludeDirs))
          } else if (/\.(js|jsx|ts|tsx|json|md|mjs)$/.test(item)) {
            // Verificar conteúdo apenas para arquivos de texto relevantes
            const content = fs.readFileSync(fullPath, "utf8")
            for (const term of searchTerms) {
              if (content.includes(term)) {
                results.push({ file: fullPath, term })
                break
              }
            }
          }
        } catch (error) {
          // Ignorar erros de leitura de arquivo
        }
      }

      return results
    }

    const referencesFound = findReferencesInFiles(process.cwd())

    if (referencesFound.length > 0) {
      foundReferences = true
      console.log("\n🚨 AINDA EXISTEM REFERÊNCIAS AO ELEVENLABS NOS SEGUINTES ARQUIVOS:")

      // Agrupar por arquivo
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
        console.log(`- ${file} (termos: ${terms.join(", ")})`)
      })
    }
  }
}

if (!foundReferences) {
  console.log("\n✅ NENHUMA REFERÊNCIA AO ELEVENLABS ENCONTRADA!")
}

console.log("\n==========================================================")
