// Script para remover o arquivo .babelrc
const fs = require("fs")
const path = require("path")

const babelrcPath = path.join(process.cwd(), ".babelrc")

if (fs.existsSync(babelrcPath)) {
  try {
    fs.unlinkSync(babelrcPath)
    console.log("✅ Arquivo .babelrc removido com sucesso.")
  } catch (error) {
    console.error("❌ Erro ao remover arquivo .babelrc:", error.message)
  }
} else {
  console.log("⚠️ Arquivo .babelrc não encontrado.")
}
