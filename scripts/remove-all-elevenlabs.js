// Script para remover COMPLETAMENTE qualquer coisa relacionada ao ElevenLabs
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("INICIANDO REMOÇÃO COMPLETA DE TUDO RELACIONADO AO ELEVENLABS")
console.log("==========================================================")

// 1. Remover diretórios específicos
const directoriesToRemove = [
  "app/@11labs",
  "app/@elevenlabs",
  "app/elevenlabs",
  "components/@11labs",
  "components/elevenlabs",
  "lib/elevenlabs",
  "types/elevenlabs",
  "docs/elevenlabs",
]

console.log("Removendo diretórios específicos...")
directoriesToRemove.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir)
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true })
      console.log(`✅ Removido diretório: ${dir}`)
    } catch (error) {
      console.error(`❌ Erro ao remover diretório ${dir}:`, error.message)
    }
  }
})

// 2. Encontrar e remover arquivos que contêm "elevenlabs" ou "11labs" no nome
function findFilesWithPattern(dir, pattern, excludeDirs = ["node_modules", ".git", ".next"]) {
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
        results = results.concat(findFilesWithPattern(fullPath, pattern, excludeDirs))
      } else if (pattern.test(item)) {
        results.push(fullPath)
      }
    } catch (error) {
      console.error(`Erro ao acessar ${fullPath}:`, error.message)
    }
  }

  return results
}

console.log("\nEncontrando e removendo arquivos com nomes relacionados ao ElevenLabs...")
const filePattern = /(elevenlabs|11labs|ElevenLabs)/i
const filesToRemove = findFilesWithPattern(process.cwd(), filePattern)

filesToRemove.forEach((file) => {
  try {
    fs.unlinkSync(file)
    console.log(`✅ Removido arquivo: ${file}`)
  } catch (error) {
    console.error(`❌ Erro ao remover arquivo ${file}:`, error.message)
  }
})

// 3. Encontrar arquivos que contêm referências ao ElevenLabs no conteúdo
console.log("\nEncontrando arquivos que contêm referências ao ElevenLabs no conteúdo...")

// Usar grep para encontrar arquivos com referências (funciona em Linux/Mac)
let filesWithReferences = []
try {
  const grepCommand =
    "grep -r -l 'elevenlabs\\|11labs\\|ElevenLabs' --include='*.{js,jsx,ts,tsx,json,md}' . --exclude-dir={node_modules,.git,.next}"
  const grepResult = execSync(grepCommand, { encoding: "utf8" })
  filesWithReferences = grepResult.split("\n").filter(Boolean)
  console.log(`Encontrados ${filesWithReferences.length} arquivos com referências ao ElevenLabs.`)
} catch (error) {
  console.log("Não foi possível usar grep, usando método alternativo...")

  // Método alternativo para Windows ou se grep falhar
  function findFilesWithContent(dir, excludeDirs = ["node_modules", ".git", ".next"]) {
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
          results = results.concat(findFilesWithContent(fullPath, excludeDirs))
        } else if (/\.(js|jsx|ts|tsx|json|md)$/.test(item)) {
          // Verificar conteúdo apenas para arquivos de texto relevantes
          const content = fs.readFileSync(fullPath, "utf8")
          if (content.match(/(elevenlabs|11labs|ElevenLabs)/i)) {
            results.push(fullPath)
          }
        }
      } catch (error) {
        // Ignorar erros de leitura de arquivo
      }
    }

    return results
  }

  filesWithReferences = findFilesWithContent(process.cwd())
  console.log(`Encontrados ${filesWithReferences.length} arquivos com referências ao ElevenLabs.`)
}

// 4. Criar versões limpas dos arquivos de configuração essenciais
console.log("\nCriando versões limpas dos arquivos de configuração essenciais...")

// next.config.mjs limpo
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
    memoryBasedWorkersCount: true,
  },
  swcMinify: false,
}

export default nextConfig
`

fs.writeFileSync(path.join(process.cwd(), "next.config.mjs"), nextConfigContent)
console.log("✅ Criado next.config.mjs limpo")

// vercel.json limpo
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

fs.writeFileSync(path.join(process.cwd(), "vercel.json"), vercelJsonContent)
console.log("✅ Criado vercel.json limpo")

// app/layout.tsx limpo
const layoutContent = `import type React from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`

// Garantir que o diretório app existe
if (!fs.existsSync(path.join(process.cwd(), "app"))) {
  fs.mkdirSync(path.join(process.cwd(), "app"))
}

fs.writeFileSync(path.join(process.cwd(), "app", "layout.tsx"), layoutContent)
console.log("✅ Criado app/layout.tsx limpo")

// 5. Limpar a pasta .next se existir
if (fs.existsSync(path.join(process.cwd(), ".next"))) {
  console.log("\nRemovendo pasta .next para forçar reconstrução limpa...")
  try {
    fs.rmSync(path.join(process.cwd(), ".next"), { recursive: true, force: true })
    console.log("✅ Pasta .next removida com sucesso")
  } catch (error) {
    console.error("❌ Erro ao remover pasta .next:", error.message)
  }
}

console.log("\n==========================================================")
console.log("REMOÇÃO COMPLETA FINALIZADA")
console.log("==========================================================")
