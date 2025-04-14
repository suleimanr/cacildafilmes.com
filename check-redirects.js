// Script para verificar redirecionamentos em projetos Next.js
const fs = require("fs")
const path = require("path")

console.log("🔍 Iniciando verificação de redirecionamentos...\n")

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (err) {
    return false
  }
}

// Função para ler um arquivo e verificar padrões
function checkFileForPattern(filePath, patterns, description) {
  if (!fileExists(filePath)) {
    console.log(`❓ ${description} não encontrado: ${filePath}`)
    return false
  }

  try {
    const content = fs.readFileSync(filePath, "utf8")
    let found = false

    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        console.log(`⚠️ ENCONTRADO em ${filePath}: ${pattern}`)
        found = true
      }
    }

    if (!found) {
      console.log(`✅ Nenhum redirecionamento encontrado em ${filePath}`)
    }

    return found
  } catch (err) {
    console.log(`❌ Erro ao ler ${filePath}: ${err.message}`)
    return false
  }
}

// Verificar next.config.js ou next.config.mjs
const nextConfigPatterns = ["redirects", "destination: '/lander'", "destination: '/lander/'", "destination: '/lander',"]

let nextConfigFound = false
const nextConfigPaths = [path.join(process.cwd(), "next.config.js"), path.join(process.cwd(), "next.config.mjs")]

for (const configPath of nextConfigPaths) {
  if (fileExists(configPath)) {
    console.log("\n🔍 Verificando configurações de redirecionamento em:", configPath)
    nextConfigFound = true
    checkFileForPattern(configPath, nextConfigPatterns, "Arquivo de configuração Next.js")
  }
}

if (!nextConfigFound) {
  console.log("\n❓ Nenhum arquivo next.config.js ou next.config.mjs encontrado")
}

// Verificar middleware
const middlewarePaths = [
  path.join(process.cwd(), "middleware.js"),
  path.join(process.cwd(), "middleware.ts"),
  path.join(process.cwd(), "src/middleware.js"),
  path.join(process.cwd(), "src/middleware.ts"),
]

console.log("\n🔍 Verificando middleware...")
let middlewareFound = false

for (const middlewarePath of middlewarePaths) {
  if (fileExists(middlewarePath)) {
    middlewareFound = true
    checkFileForPattern(middlewarePath, ["redirect", "'/lander'", "'/lander/'", "NextResponse.redirect"], "Middleware")
  }
}

if (!middlewareFound) {
  console.log("✅ Nenhum arquivo middleware encontrado")
}

// Verificar páginas principais
const mainPagePatterns = [
  "router.push('/lander')",
  "router.replace('/lander')",
  "redirect('/lander')",
  "window.location.href = '/lander'",
]

console.log("\n🔍 Verificando páginas principais...")

// App Router
const appPagePaths = [
  path.join(process.cwd(), "app/page.js"),
  path.join(process.cwd(), "app/page.tsx"),
  path.join(process.cwd(), "src/app/page.js"),
  path.join(process.cwd(), "src/app/page.tsx"),
]

let appPageFound = false
for (const pagePath of appPagePaths) {
  if (fileExists(pagePath)) {
    appPageFound = true
    checkFileForPattern(pagePath, mainPagePatterns, "Página principal (App Router)")
  }
}

if (!appPageFound) {
  console.log("❓ Nenhuma página principal do App Router encontrada")
}

// Pages Router
const pagesIndexPaths = [
  path.join(process.cwd(), "pages/index.js"),
  path.join(process.cwd(), "pages/index.tsx"),
  path.join(process.cwd(), "src/pages/index.js"),
  path.join(process.cwd(), "src/pages/index.tsx"),
]

let pagesIndexFound = false
for (const pagePath of pagesIndexPaths) {
  if (fileExists(pagePath)) {
    pagesIndexFound = true
    checkFileForPattern(pagePath, mainPagePatterns, "Página principal (Pages Router)")
  }
}

if (!pagesIndexFound) {
  console.log("❓ Nenhuma página index do Pages Router encontrada")
}

// Verificar layouts
console.log("\n🔍 Verificando layouts...")
const layoutPaths = [
  path.join(process.cwd(), "app/layout.js"),
  path.join(process.cwd(), "app/layout.tsx"),
  path.join(process.cwd(), "src/app/layout.js"),
  path.join(process.cwd(), "src/app/layout.tsx"),
]

let layoutFound = false
for (const layoutPath of layoutPaths) {
  if (fileExists(layoutPath)) {
    layoutFound = true
    checkFileForPattern(layoutPath, mainPagePatterns, "Layout principal")
  }
}

if (!layoutFound) {
  console.log("❓ Nenhum layout principal encontrado")
}

// Verificar se existe a página lander
console.log("\n🔍 Verificando se existe a página lander...")
const landerPaths = [
  path.join(process.cwd(), "app/lander/page.js"),
  path.join(process.cwd(), "app/lander/page.tsx"),
  path.join(process.cwd(), "src/app/lander/page.js"),
  path.join(process.cwd(), "src/app/lander/page.tsx"),
  path.join(process.cwd(), "pages/lander.js"),
  path.join(process.cwd(), "pages/lander.tsx"),
  path.join(process.cwd(), "src/pages/lander.js"),
  path.join(process.cwd(), "src/pages/lander.tsx"),
  path.join(process.cwd(), "pages/lander/index.js"),
  path.join(process.cwd(), "pages/lander/index.tsx"),
  path.join(process.cwd(), "src/pages/lander/index.js"),
  path.join(process.cwd(), "src/pages/lander/index.tsx"),
]

let landerPageFound = false
for (const landerPath of landerPaths) {
  if (fileExists(landerPath)) {
    landerPageFound = true
    console.log(`⚠️ Página lander encontrada: ${landerPath}`)
  }
}

if (!landerPageFound) {
  console.log("✅ Nenhuma página lander encontrada")
}

console.log("\n🔍 Verificação concluída!")
console.log("\nSe nenhum redirecionamento foi encontrado no código, verifique as configurações no painel da Vercel:")
console.log("1. Acesse o dashboard da Vercel")
console.log("2. Selecione seu projeto")
console.log('3. Vá para "Settings" > "Domains"')
console.log("4. Verifique se há algum redirecionamento configurado para o domínio principal")
