import { NextResponse } from "next/server"

// Interface para tipagem dos dados do cliente
interface ClienteRoteiro {
  nome_completo: string
  empresa: string
  tema_desejado: string
  email: string
  telefone: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { nome_completo, empresa, tema_desejado, email, telefone } = body as ClienteRoteiro

    // Validação dos campos obrigatórios
    if (!nome_completo || !empresa || !tema_desejado || !email || !telefone) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados incompletos",
          missingFields: [
            !nome_completo && "nome_completo",
            !empresa && "empresa",
            !tema_desejado && "tema_desejado",
            !email && "email",
            !telefone && "telefone",
          ].filter(Boolean),
        },
        { status: 400 },
      )
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Formato de email inválido",
        },
        { status: 400 },
      )
    }

    // Log para debug
    console.log("Enviando dados para o Supabase:", {
      nome_completo,
      empresa,
      tema_desejado,
      email,
      telefone,
    })

    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Variáveis de ambiente do Supabase não configuradas")
      return NextResponse.json(
        {
          success: false,
          error: "Erro de configuração do servidor",
        },
        { status: 500 },
      )
    }

    // Enviar dados para o Supabase
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/clientes_roteiros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        nome_completo,
        empresa,
        tema_desejado,
        email,
        telefone,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Erro Supabase:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao salvar no Supabase",
          details: errorText,
        },
        { status: 500 },
      )
    }

    console.log("Cliente salvo com sucesso!")
    return NextResponse.json({
      success: true,
      message: "Cliente salvo com sucesso",
    })
  } catch (error: any) {
    console.error("Erro geral:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
