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
     const content = fs.readFileSync(configFile, "utf8")
     const originalContent = content

     // Verificar se o arquivo contém referências ao ElevenLabs
     const hasReferences = searchTerms.some((term) => content.includes(term))

     if (hasReferences) {
       console.log(`Encontradas referências ao Ele
