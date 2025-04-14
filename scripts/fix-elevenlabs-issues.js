// Script para remover referências ao ElevenLabs sem danificar funcionalidades
const fs = require("fs")
const path = require("path")

console.log("Iniciando remoção de referências ao ElevenLabs...")

// Função para encontrar arquivos recursivamente
function findFiles(dir, pattern, excludeDirs = ["node_modules", ".next", ".git"]) {
  let results = []

  if (!fs.existsSync(dir)) {
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
        results = results.concat(findFiles(itemPath, pattern, excludeDirs))
      } else if (stat.isFile() && pattern.test(item)) {
        results.push(itemPath)
      }
    } catch (error) {
      console.error(`Erro ao acessar ${itemPath}:`, error.message)
    }
  }

  return results
}

// Função para verificar se um arquivo contém referências ao ElevenLabs
function containsElevenLabsReferences(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const patterns = [/elevenlabs/i, /11labs/i, /ElevenLabs/i, /@elevenlabs/i, /@11labs/i]

    return patterns.some((pattern) => pattern.test(content))
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error.message)
    return false
  }
}

// Função para limpar referências ao ElevenLabs em um arquivo
function cleanElevenLabsReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")
    const originalContent = content

    // Padrões para substituição
    const replacements = [
      { pattern: /import.*['"]elevenlabs.*['"]/g, replacement: "// Removed elevenlabs import" },
      { pattern: /import.*['"]@elevenlabs\/.*['"]/g, replacement: "// Removed elevenlabs import" },
      { pattern: /import.*['"].*11labs.*['"]/g, replacement: "// Removed 11labs import" },
      { pattern: /import.*['"].*@11labs.*['"]/g, replacement: "// Removed 11labs import" },
      { pattern: /require\s*$$\s*['"]elevenlabs.*['"]\s*$$/g, replacement: "{}" },
      { pattern: /require\s*$$\s*['"]@elevenlabs\/.*['"]\s*$$/g, replacement: "{}" },
      { pattern: /require\s*$$\s*['"].*11labs.*['"]\s*$$/g, replacement: "{}" },
      { pattern: /require\s*$$\s*['"].*@11labs.*['"]\s*$$/g, replacement: "{}" },
      { pattern: /11labs\s*:/g, replacement: "removed_11labs:" },
      { pattern: /elevenlabs\s*:/g, replacement: "removed_elevenlabs:" },
      { pattern: /ElevenLabs/g, replacement: "RemovedElevenLabs" },
      { pattern: /Elevenlabs/g, replacement: "RemovedElevenlabs" },
      { pattern: /elevenlabs/g, replacement: "removed_elevenlabs" },
      { pattern: /@11labs/g, replacement: "@removed_11labs" },
      { pattern: /@elevenlabs/g, replacement: "@removed_elevenlabs" },
      { pattern: /<ElevenLabs.*?>/g, replacement: "{/* ElevenLabs component removed */}" },
      { pattern: /<\/ElevenLabs.*?>/g, replacement: "{/* /ElevenLabs component removed */}" },
      { pattern: /ELEVENLABS_/g, replacement: "REMOVED_ELEVENLABS_" },
      { pattern: /NEXT_PUBLIC_ELEVENLABS_/g, replacement: "REMOVED_NEXT_PUBLIC_ELEVENLABS_" },
    ]

    // Aplicar substituições
    for (const { pattern, replacement } of replacements) {
      content = content.replace(pattern, replacement)
    }

    // Verificar se o conteúdo foi modificado
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`✅ Limpas referências em: ${filePath}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`Erro ao limpar ${filePath}:`, error.message)
    return false
  }
}

// Função para remover diretórios específicos
function removeDirectories() {
  const dirsToRemove = [
    "app/@11labs",
    "app/@elevenlabs",
    "app/elevenlabs",
    "components/@11labs",
    "components/elevenlabs",
    "lib/elevenlabs",
    "types/elevenlabs",
  ]

  let removedCount = 0

  for (const dir of dirsToRemove) {
    const dirPath = path.join(process.cwd(), dir)

    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true })
        console.log(`✅ Removido diretório: ${dir}`)
        removedCount++
      } catch (error) {
        console.error(`❌ Erro ao remover diretório ${dir}:`, error.message)
      }
    }
  }

  console.log(`Total de ${removedCount} diretórios removidos.`)
}

// Função para remover arquivos específicos
function removeSpecificFiles() {
  const filesToRemove = [
    "components/ElevenLabsStreaming.tsx",
    "components/ElevenLabsToolHandler.tsx",
    "lib/elevenlabs-config.ts",
    "lib/elevenlabs-service.ts",
    "types/elevenlabs.ts",
  ]

  let removedCount = 0

  for (const file of filesToRemove) {
    const filePath = path.join(process.cwd(), file)

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
        console.log(`✅ Removido arquivo: ${file}`)
        removedCount++
      } catch (error) {
        console.error(`❌ Erro ao remover arquivo ${file}:`, error.message)
      }
    }
  }

  console.log(`Total de ${removedCount} arquivos específicos removidos.`)
}

// Função para limpar arquivos de configuração
function cleanConfigFiles() {
  // Limpar next.config.mjs
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['v0.blob.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com', 'vumbnail.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    return config
  },
  compress: false,
  experimental: {
    serverExternalPackages: ['sharp'],
  },
  swcMinify: false,
}

export default nextConfig
`
    fs.writeFileSync(nextConfigPath, nextConfigContent)
    console.log("✅ Criado next.config.mjs limpo")
  }

  // Limpar .babelrc
  const babelrcPath = path.join(process.cwd(), ".babelrc")
  if (fs.existsSync(babelrcPath)) {
    // Remover completamente o .babelrc para permitir o uso do SWC
    fs.unlinkSync(babelrcPath)
    console.log("✅ Removido .babelrc para permitir o uso do SWC")
  }

  // Atualizar vercel.json
  const vercelJsonPath = path.join(process.cwd(), "vercel.json")
  if (fs.existsSync(vercelJsonPath)) {
    const vercelJsonContent = `{
  "buildCommand": "NODE_OPTIONS='--max-old-space-size=4096' next build",
  "installCommand": "npm install --legacy-peer-deps --no-optional",
  "framework": "nextjs",
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 60
    }
  }
}
`
    fs.writeFileSync(vercelJsonPath, vercelJsonContent)
    console.log("✅ Atualizado vercel.json")
  }
}

// Função para verificar e corrigir o arquivo app/portfolio/layout.tsx
function fixPortfolioLayout() {
  const layoutPath = path.join(process.cwd(), "app", "portfolio", "layout.tsx")

  if (fs.existsSync(layoutPath)) {
    try {
      const content = fs.readFileSync(layoutPath, "utf8")

      // Verificar se usa next/font
      if (content.includes("next/font")) {
        // Substituir por uma versão que não usa next/font
        const newContent = `import type React from "react"
import type { Metadata } from "next"
import Sidebar from "@/components/Sidebar"
import PortfolioHeader from "@/components/PortfolioHeader"

export const metadata: Metadata = {
  title: "Portfólio | Cacilda Filmes",
  description: "Conheça nossos trabalhos e projetos",
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-black min-h-screen">
      <PortfolioHeader />
      <Sidebar />
      <div className="pt-8 sm:pt-12">{children}</div>
    </div>
  )
}
`
        fs.writeFileSync(layoutPath, newContent)
        console.log("✅ Corrigido app/portfolio/layout.tsx para remover next/font")
      }
    } catch (error) {
      console.error(`Erro ao corrigir ${layoutPath}:`, error.message)
    }
  }
}

// Executar as funções
console.log("Removendo diretórios específicos...")
removeDirectories()

console.log("\nRemovendo arquivos específicos...")
removeSpecificFiles()

console.log("\nLimpando arquivos de configuração...")
cleanConfigFiles()

console.log("\nCorrigindo app/portfolio/layout.tsx...")
fixPortfolioLayout()

console.log("\nProcurando e limpando referências ao ElevenLabs em outros arquivos...")
const jsFiles = findFiles(".", /\.(js|jsx|ts|tsx|json|mjs)$/)
let cleanedCount = 0

for (const file of jsFiles) {
  if (containsElevenLabsReferences(file)) {
    const cleaned = cleanElevenLabsReferences(file)
    if (cleaned) {
      cleanedCount++
    }
  }
}

console.log(`\nTotal de ${cleanedCount} arquivos limpos de referências ao ElevenLabs.`)
console.log("\nRemoção de referências ao ElevenLabs concluída com sucesso!")
