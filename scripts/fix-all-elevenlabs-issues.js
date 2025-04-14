// Script master para executar todos os scripts de correção em sequência
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("Iniciando processo de correção completa de problemas relacionados ao ElevenLabs...")

// Lista de scripts a serem executados em ordem
const scripts = [
  "remove-problematic-files.js",
  "fix-11labs-syntax.js",
  "fix-layout-file.js",
  "fix-next-generated-files.js",
]

// Verificar se todos os scripts existem
for (const script of scripts) {
  const scriptPath = path.join(process.cwd(), "scripts", script)
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script não encontrado: ${scriptPath}`)
    console.log("Criando script...")

    // Criar o script se ele não existir
    try {
      const templatePath = path.join(process.cwd(), "scripts", scripts[0])
      if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, "utf8")
        fs.writeFileSync(scriptPath, template, "utf8")
        console.log(`Script criado: ${scriptPath}`)
      } else {
        console.error(`Não foi possível criar o script ${script} porque o template não existe.`)
      }
    } catch (error) {
      console.error(`Erro ao criar script ${script}:`, error.message)
    }
  }
}

// Executar cada script em sequência
for (const script of scripts) {
  const scriptPath = path.join(process.cwd(), "scripts", script)
  if (fs.existsSync(scriptPath)) {
    console.log(`\nExecutando script: ${script}`)
    try {
      execSync(`node ${scriptPath}`, { stdio: "inherit" })
      console.log(`✅ Script ${script} executado com sucesso.`)
    } catch (error) {
      console.error(`❌ Erro ao executar script ${script}:`, error.message)
    }
  } else {
    console.error(`Script não encontrado: ${scriptPath}`)
  }
}

// Atualizar vercel.json para usar o script master
const vercelJsonPath = path.join(process.cwd(), "vercel.json")
if (fs.existsSync(vercelJsonPath)) {
  try {
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, "utf8"))

    // Atualizar buildCommand para usar o script master
    vercelJson.buildCommand =
      "node scripts/fix-all-elevenlabs-issues.js && NODE_OPTIONS='--max-old-space-size=4096' next build"

    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 2), "utf8")
    console.log("✅ vercel.json atualizado com sucesso.")
  } catch (error) {
    console.error("❌ Erro ao atualizar vercel.json:", error.message)
  }
}

// Atualizar package.json para usar o script master
const packageJsonPath = path.join(process.cwd(), "package.json")
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

    // Atualizar scripts para usar o script master
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    packageJson.scripts.prebuild = "node scripts/fix-all-elevenlabs-issues.js"

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8")
    console.log("✅ package.json atualizado com sucesso.")
  } catch (error) {
    console.error("❌ Erro ao atualizar package.json:", error.message)
  }
}

console.log("\n===========================================")
console.log("Processo de correção completa finalizado!")
console.log("===========================================")
