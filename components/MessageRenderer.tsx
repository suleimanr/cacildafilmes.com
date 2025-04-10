import ColoredResponseCard, { type CardType } from "./ColoredResponseCard"
import MessageContent from "./MessageContent"

interface MessageRendererProps {
  message: {
    role: "user" | "assistant"
    content: string
    id: string
    cardType?: CardType
  }
}

export default function MessageRenderer({ message }: MessageRendererProps) {
  return (
    <div className={`mb-6 sm:mb-8 md:mb-12 message-item ${message.role === "user" ? "pl-2 sm:pl-8 md:pl-16" : ""}`}>
      {message.role === "user" && (
        <div className="uppercase text-white mb-2 tracking-wider text-sm sm:text-base">VOCÊ:</div>
      )}
      {message.role === "assistant" && (
        <div className="uppercase text-white mb-2 tracking-wider text-sm sm:text-base">CACILDA:</div>
      )}

      {message.cardType ? (
        <ColoredResponseCard
          type={message.cardType}
          title={
            message.cardType === "portfolio"
              ? "Portfólio Cacilda Filmes"
              : message.cardType === "servicos"
                ? "Serviços Cacilda Filmes"
                : message.cardType === "sobre"
                  ? "Sobre a Cacilda Filmes"
                  : "Contato Cacilda Filmes"
          }
          subtitle={
            message.cardType === "portfolio"
              ? "Conheça nossos trabalhos"
              : message.cardType === "servicos"
                ? "O que oferecemos"
                : message.cardType === "sobre"
                  ? "Quem somos"
                  : "Fale conosco"
          }
          content={message.content}
        />
      ) : (
        <MessageContent content={message.content} />
      )}
    </div>
  )
}
