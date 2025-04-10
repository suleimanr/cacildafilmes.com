import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Função para obter cliente Supabase
const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    throw new Error("Configuração do Supabase ausente")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: Request) {
  try {
    console.log("Iniciando /api/chat/start")

    // Verificar variáveis de ambiente
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada")
      return NextResponse.json({ error: "Configuração da API OpenAI ausente." }, { status: 500 })
    }

    if (!process.env.OPENAI_ASSISTANT_ID) {
      console.error("OPENAI_ASSISTANT_ID não configurado")
      return NextResponse.json({ error: "ID do Assistente OpenAI não configurado." }, { status: 500 })
    }

    // Extrair dados da requisição
    const body = await req.json()
    console.log("Corpo da requisição:", JSON.stringify(body))

    const { userId, message } = body

    if (!userId || !message) {
      console.error("Parâmetros ausentes:", { userId: !!userId, message: !!message })
      return NextResponse.json({ error: "userId e message são obrigatórios." }, { status: 400 })
    }

    // Buscar threadId existente no Supabase
    let threadId
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("chat_threads")
        .select("thread_id")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) throw error
      threadId = data?.thread_id

      console.log("Thread existente:", threadId)
    } catch (err) {
      console.error("Erro ao buscar thread no Supabase:", err)
      // Continuar sem threadId, vamos criar um novo
    }

    // Se não encontrou threadId, criar uma nova thread
    if (!threadId) {
      console.log("Criando nova thread")
      try {
        const thread = await openai.beta.threads.create()
        threadId = thread.id
        console.log("Nova thread criada:", threadId)

        // Salvar no Supabase
        try {
          const supabase = getSupabase()
          const { error } = await supabase.from("chat_threads").insert({
            user_id: userId,
            thread_id: threadId,
            created_at: new Date().toISOString(),
          })

          if (error) throw error
          console.log("Thread salva no Supabase")
        } catch (err) {
          console.error("Erro ao salvar thread no Supabase:", err)
          // Continuar mesmo se falhar ao salvar
        }
      } catch (err) {
        console.error("Erro ao criar thread na OpenAI:", err)
        return NextResponse.json({ error: "Erro ao criar thread de conversa." }, { status: 500 })
      }
    }

    // Adicionar mensagem à thread
    try {
      console.log("Adicionando mensagem à thread")
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      })
      console.log("Mensagem adicionada com sucesso")
    } catch (err) {
      console.error("Erro ao adicionar mensagem:", err)
      return NextResponse.json({ error: "Erro ao adicionar mensagem à conversa." }, { status: 500 })
    }

    // Executar o assistente
    try {
      console.log("Executando assistente")
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID!,
      })
      console.log("Assistente executado, runId:", run.id)

      return NextResponse.json({ runId: run.id, threadId })
    } catch (err) {
      console.error("Erro ao executar assistente:", err)
      return NextResponse.json({ error: "Erro ao processar sua mensagem." }, { status: 500 })
    }
  } catch (err) {
    console.error("[start] Erro geral:", err)
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 })
  }
}
