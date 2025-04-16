// Script master para remover completamente tudo relacionado ao ElevenLabs
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("INICIANDO REMOÇÃO COMPLETA DE TUDO RELACIONADO AO ELEVENLABS")
console.log("==========================================================")

// Lista de scripts a serem executados em ordem
const scripts = [
  "remove-elevenlabs-directories.js",
  "remove-elevenlabs-files.js",
  "remove-all-elevenlabs.js",
  "check-elevenlabs-references.js",
  "remove-babelrc.js", // Adicionado script para remover .babelrc
]

// Verificar se todos os scripts existem
for (const script of scripts) {
  const scriptPath = path.join(process.cwd(), "scripts", script)
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script não encontrado: ${scriptPath}`)
    console.log("Pulando...")
    continue
  }

  // Executar o script
  console.log(`
Executando script: ${script}`)
  try {
    execSync(`node scripts/${script}`, { stdio: "inherit" })
    console.log(`✅ Script ${script} executado com sucesso.`)
  } catch (error) {
    console.error(`❌ Erro ao executar script ${script}:`, error.message)
  }
}

// Criar versões limpas dos arquivos de configuração essenciais
console.log(
  "\
Criando versões limpas dos arquivos de configuração essenciais...",
)

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

// Limpar a pasta .next se existir
if (fs.existsSync(path.join(process.cwd(), ".next"))) {
  console.log(
    "\
Removendo pasta .next para forçar reconstrução limpa...",
  )
  try {
    fs.rmSync(path.join(process.cwd(), ".next"), { recursive: true, force: true })
    console.log("✅ Pasta .next removida com sucesso")
  } catch (error) {
    console.error("❌ Erro ao remover pasta .next:", error.message)
  }
}

console.log(
  "\
==========================================================",
)
console.log("REMOÇÃO COMPLETA FINALIZADA")
console.log("==========================================================")
