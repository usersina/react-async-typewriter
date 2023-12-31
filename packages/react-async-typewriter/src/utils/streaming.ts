/**
 * Get an async iterable stream from a `ReadableStream` and decode each chunk as a string.
 *
 * @param body The `ReadableStream` stream to iterate over.
 * @example
 * ```ts
 * const response = await fetch(`/stream`)
 * const stream = getIterableStream(response.body)
 * for await (const chunk of stream) {
 *    console.log(chunk)
 * }
 * ```
 *
 * If you want to get structured data from a stream, use `getIterableJsonStream` instead.
 */
export async function* getIterableStream(
  /**
   * The `ReadableStream` stream to iterate over. This is usually the `body` property of a `Response` object.
   */
  body: ReadableStream<Uint8Array>
): AsyncIterable<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()

  let readResult = await reader.read()
  while (!readResult.done) {
    const chunk = decoder.decode(readResult.value)
    yield chunk
    readResult = await reader.read()
  }
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get an async iterable stream from a `ReadableStream` and parse each chunk as JSON.
 * This is useful for streaming JSON responses from a server. Only works
 * with JSON objects that do not include child objects.
 *
 * @param body The `ReadableStream` stream to iterate over. Should be an `application/x-ndjson` stream.
 * @example
 * ```ts
 * const response = await fetch(`/stream`)
 * const stream = getIterableJsonStream<T>(response.body)
 * for await (const chunk of stream) {
 *    console.log(chunk) // chunk is a valid json object of type T
 * }
 * ```
 *
 * If you want to get a stream of strings, use `getIterableStream` instead.
 */
export async function* getIterableJsonStream<T>(
  body: ReadableStream<Uint8Array>
): AsyncIterable<T> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // TODO: Create robust tests
  // console.log('Simulating waiting for data...')
  // await wait(5000)

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      if (buffer) {
        // Parse the last line if it exists
        yield JSON.parse(buffer)
      }
      return
    }

    // Decode the chunk to text
    const chunk = decoder.decode(value)

    // Split the chunk by newline and handle each line
    const lines = (buffer + chunk).split('\n')

    // Keep the last line in the buffer if it's not complete
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line) {
        yield JSON.parse(line)
      }
    }
  }
}
