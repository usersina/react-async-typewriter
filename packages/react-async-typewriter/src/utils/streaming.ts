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
export async function* getIterableStream<T = string>(
  /**
   * The `ReadableStream` stream to iterate over. This is usually the `body` property of a `Response` object.
   */
  body: ReadableStream<Uint8Array>,
  /**
   * The function used to parse each chunk (or sub-chunk if `chunkSplitter`) is used to the `T` type.
   *
   * Useful if you want to type the stream result.
   */
  parser?: (chunk: string) => T,
  /**
   * The regular expressions used to further split each chunk into sub-chunks.
   * This is useful since different chunks from a streaming endpoint can be considered as a single chunks in the client
   * hence breaking any parsing done on a chunk-basis.
   *
   *@example
   * ```ts
   * chunkSplitter {
   *  splitRegExp: /(?<=})\n\ndata: (?={)/,
   *  replaceRegExp: /^data: /
   * }
   * ```
   * Will divide the following server chunks
   *
   * ```json
   * data: {"num":1}
   *
   * data: {"num":2}
   *
   * ...
   *
   * data: {"num":n}
   * ```
   *
   * to the following
   *
   * ```txt
   * {"num":1}{"num":2}...{"num":n}
   * ```
   */
  chunkSplitter?: {
    splitRegExp: RegExp
    replaceRegExp: RegExp
  }
): AsyncIterable<T> {
  const reader = body.getReader()
  const decoder = new TextDecoder()

  let readResult = await reader.read()
  while (!readResult.done) {
    const chunk = decoder.decode(readResult.value)
    const subChunks = chunkSplitter
      ? chunk.split(chunkSplitter.splitRegExp)
      : chunk

    for (const subChunk of subChunks) {
      const payload = chunkSplitter
        ? subChunk.replace(chunkSplitter.replaceRegExp, '')
        : subChunk

      if (!parser) yield payload as unknown as T
      else yield parser(payload)
    }

    readResult = await reader.read()
  }
}
