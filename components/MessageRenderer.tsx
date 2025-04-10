"use client"

import type React from "react"
import MessageContent from "./MessageContent"

interface Message {
  role: string
  content: string
}

interface MessageRendererProps {
  message: Message
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ message }) => {
  return (
    <div className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
      <MessageContent content={message.content} />
    </div>
  )
}

export default MessageRenderer
