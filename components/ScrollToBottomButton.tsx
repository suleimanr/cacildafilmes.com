"use client"

interface ScrollToBottomButtonProps {
  onClick: () => void
  unreadCount?: number
}

export default function ScrollToBottomButton({ onClick, unreadCount = 0 }: ScrollToBottomButtonProps) {
  return (
    <button
      className="fixed bottom-24 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg z-40 flex items-center justify-center"
      onClick={onClick}
      aria-label="Rolar para o final"
    >
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clipRule="evenodd"
          transform="rotate(180, 10, 10)"
        />
      </svg>
    </button>
  )
}
