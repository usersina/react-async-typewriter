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

/**
 * Get an async iterable stream from a `ReadableStream` and parse each chunk as JSON.
 * This is useful for streaming JSON responses from a server. Only works
 * with JSON objects that do not include child objects.
 *
 * @param body The `ReadableStream` stream to iterate over.
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
  let pending = ''

  let readResult = await reader.read()
  while (!readResult.done) {
    const chunk = decoder.decode(readResult.value, { stream: true })
    pending += chunk
    let boundary = pending.indexOf('}')
    while (boundary !== -1) {
      const jsonString = pending.substring(0, boundary + 1)
      yield JSON.parse(jsonString)
      pending = pending.substring(boundary + 1)
      boundary = pending.indexOf('}')
    }
    readResult = await reader.read()
  }
  if (pending.trim() !== '') {
    yield JSON.parse(pending)
  }
}
