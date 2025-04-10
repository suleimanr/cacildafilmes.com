"use client"

// Este componente foi substituído pela implementação direta no app/page.tsx

import type { Message } from "@/types/Message"
import type { CardType } from "@/types/CardType"
import type { Dispatch, SetStateAction } from "react"

interface ChatInterfaceProps {
  setMessages: Dispatch<SetStateAction<Message[]>>
  scrollToBottom: () => void
}

export default function ChatInterface({ setMessages, scrollToBottom }: ChatInterfaceProps) {
  return null
}

// Restaurar os textos dos cards de respostas rápidas e o botão do portfólio

// Adicionar ou restaurar a função handleQuickAccessClick que processa os tópicos de acesso rápido
const handleQuickAccessClick = async (topic: string) => {
  // Definir as respostas para cada tópico
  const responses: Record<
    string,
    { title: string; subtitle: string; content: string; buttonText?: string; buttonLink?: string }
  > = {
    portfolio: {
      title: "Nosso Portfólio",
      subtitle: "Conheça nossos trabalhos mais recentes",
      content:
        "A Cacilda Filmes tem um portfólio diversificado com produções para grandes marcas como Grupo Boticário, XP Inc, Consórcio Magalu e muitos outros. Nossos vídeos abrangem desde campanhas publicitárias até documentários e conteúdo para redes sociais.",
      buttonText: "Ver Portfólio Completo",
      buttonLink: "/portfolio",
    },
    servicos: {
      title: "Nossos Serviços",
      subtitle: "Soluções completas em produção audiovisual",
      content:
        "Oferecemos serviços completos de produção audiovisual, desde a concepção da ideia até a finalização. Nossos serviços incluem: produção de comerciais, vídeos institucionais, documentários, conteúdo para redes sociais, animação 2D e 3D, edição e pós-produção.",
    },
    sobre: {
      title: "Sobre a Cacilda Filmes",
      subtitle: "Produtora audiovisual com foco em resultados",
      content:
        "A Cacilda Filmes é uma produtora audiovisual fundada em 2015, especializada em criar conteúdo que conecta marcas e pessoas. Com uma equipe experiente e criativa, desenvolvemos projetos que transformam objetivos de comunicação em resultados concretos para nossos clientes.",
    },
    contato: {
      title: "Entre em Contato",
      subtitle: "Vamos conversar sobre o seu projeto",
      content:
        "Estamos prontos para transformar suas ideias em realidade. Entre em contato conosco para discutir seu próximo projeto audiovisual e descobrir como podemos ajudar sua marca a se destacar.",
    },
  }

  // Obter a resposta para o tópico selecionado
  const response = responses[topic]

  if (response) {
    // Adicionar a resposta ao estado de mensagens
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
      responseCard: {
        type: topic as CardType,
        ...response,
      },
    }

    setMessages((prev) => [...prev, newMessage])

    // Rolar para o final após a adição da mensagem
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
}
