import MessageContent from "./MessageContent"
import ColoredResponseCard, { type CardType } from "./ColoredResponseCard"

interface MessageRendererProps {
  role: "user" | "assistant"
  content: string
  id: string
  cardType?: CardType
}

export default function MessageRenderer({ role, content, id, cardType }: MessageRendererProps) {
  return (
    <div
      key={id}
      id={id}
      className={`mb-6 sm:mb-8 md:mb-12 message-item ${role === "user" ? "pl-2 sm:pl-8 md:pl-16" : ""}`}
    >
      {role === "user" && <div className="uppercase text-white mb-2 tracking-wider text-sm sm:text-base">VOCÊ:</div>}
      {role === "assistant" && (
        <div className="uppercase text-white mb-2 tracking-wider text-sm sm:text-base">CACILDA:</div>
      )}
      {cardType ? (
        <ColoredResponseCard
          type={cardType}
          title={
            cardType === "portfolio"
              ? "Portfólio Cacilda Filmes"
              : cardType === "servicos"
                ? "Serviços Cacilda Filmes"
                : cardType === "sobre"
                  ? "Sobre a Cacilda Filmes"
                  : "Contato Cacilda Filmes"
          }
          subtitle={
            cardType === "portfolio"
              ? "Conheça nossos trabalhos"
              : cardType === "servicos"
                ? "O que oferecemos"
                : cardType === "sobre"
                  ? "Quem somos"
                  : "Fale conosco"
          }
          content={content}
        />
      ) : (
        <MessageContent content={content} />
      )}
    </div>
  )
}
