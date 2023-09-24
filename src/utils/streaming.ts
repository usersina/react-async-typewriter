/**
 * Get an async iterable stream from a `ReadableStream`.
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
 */
export async function* getIterableStream(
  /**
   * The `ReadableStream` stream to iterate over. This is usually the `body` property of a `Response` object.
   */
  body: ReadableStream<Uint8Array>
): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  let readResult = await reader.read();
  while (!readResult.done) {
    yield decoder.decode(readResult.value);
    readResult = await reader.read();
  }
}
