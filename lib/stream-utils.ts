/**
 * Cria um ReadableStream a partir de uma string
 */
export function createReadableStream(content: string): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(content))
      controller.close()
    },
  })
}
