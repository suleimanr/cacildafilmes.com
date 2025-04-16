// Script para corrigir o problema específico no arquivo app/layout.tsx
const fs = require("fs")
const path = require("path")

const layoutFile = path.join(process.cwd(), "app", "layout.tsx")

console.log(`Verificando e corrigindo o arquivo ${layoutFile}...`)

if (fs.existsSync(layoutFile)) {
  try {
    let content = fs.readFileSync(layoutFile, "utf8")
    const originalContent = content

    // Remover qualquer referência a 11labs ou elevenlabs
    content = content.replace(/import.*?['"].*?11labs.*?['"]/g, "// Removed 11labs import")
    content = content.replace(/import.*?['"].*?elevenlabs.*?['"]/g, "// Removed elevenlabs import")

    // Remover qualquer configuração de layout relacionada a 11labs ou elevenlabs
    content = content.replace(/11labs\s*:\s*\[.*?\]/gs, "")
    content = content.replace(/elevenlabs\s*:\s*\[.*?\]/gs, "")

    // Substituir o layout por uma versão simplificada se necessário
    if (content.includes("11labs") || content.includes("elevenlabs")) {
      console.log("Substituindo o arquivo layout.tsx por uma versão simplificada...")

      content = `import type React from "react"

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
    }

    // Verificar se o conteúdo foi modificado
    if (content !== originalContent) {
      fs.writeFileSync(layoutFile, content, "utf8")
      console.log(`✅ Arquivo ${layoutFile} modificado com sucesso.`)
    } else {
      console.log(`⚠️ Nenhuma modificação necessária em ${layoutFile}.`)
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${layoutFile}:`, error.message)
  }
} else {
  console.log(`⚠️ Arquivo ${layoutFile} não encontrado.`)
}
