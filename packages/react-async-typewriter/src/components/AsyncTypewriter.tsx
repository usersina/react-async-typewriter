import React, { useCallback, useEffect, useRef, useState } from 'react'

interface WrapperProps {
  /**
   * The text that's being typed.
   */
  text: string
}

interface AsyncTypewriterProps<T = string> {
  /**
   * The stream to read and type from.
   */
  stream: AsyncIterable<T>
  /**
   * If a type `T` is provided, this helps getting the text out of the chunk.
   */
  chunkAccessor?: keyof T
  /**
   * The delay between typing each character in milliseconds. Default is `20`.
   */
  delay?: number
  /**
   * The time to wait before calling the `onTypingEnd` callback in milliseconds. Default is `1000`.
   * Increasing this value guarantees that slow streams will have enough time to finish typing.
   */
  abortDelay?: number
  /**
   * Whether or not to stop typing as soon as the stream is finished. This also calls the `onTypingEnd` callback.
   *
   * Default is `false`.
   */
  earlyStop?: boolean
  /**
   * Callback for when the message finishes typing. Note that the stream can be closed before the message finishes typing.
   */
  onTypingEnd?: (message: string) => void
  /**
   * Callback for when the stream ends. This does not return the message intentionally. Instead, enable `earlyStop` and use `onTypingEnd`.
   */
  onStreamEnd?: () => void
  // /**
  //  * Whether or not to continuously scroll to the bottom of the container as soon as text is typed. Default is `true`.
  //  */
  // continuousScroll?: boolean;
  /**
   * The wrapper element to wrap the typed text in. Default is `span`.
   */
  Wrapper?: React.ElementType<WrapperProps>
}

/**
 * A component that types text from an async iterable stream character by character.
 *
 * It also handles slow streams by waiting for a bit before calling the optional `onEnd` callback.
 *
 * @example
 * ```tsx
 * <AsyncTypewriter
 *   stream={stream}
 *   Wrapper={({ text }) => <p>{text}</p>}
 * />
 * ```
 */
export function AsyncTypewriter<T = string>({
  stream,
  chunkAccessor,
  delay = 20,
  abortDelay = 1000,
  earlyStop,
  onTypingEnd,
  onStreamEnd,
  // continuousScroll = true,
  Wrapper,
}: AsyncTypewriterProps<T>) {
  if (earlyStop && !onTypingEnd) {
    throw new Error(
      'The `earlyStop` prop is set to true but the `onTypingEnd` prop is not provided.'
    )
  }

  // const scrollTargetRef = useRef<HTMLDivElement>(null);

  /**
   * This ensures that `onTypingEnd` is not called before the first chunk is received.
   */
  const firstChunkReceivedRef = useRef(false)

  /**
   * This is a ref to ensure no endless loop is caused by the `useCallback` hook.
   */
  const onTypingEndRef = useRef(onTypingEnd)

  /**
   * This is a ref to ensure no endless loop is caused by the `useCallback` hook.
   */
  const isStreamFinishedRef = useRef(false)

  /**
   * This is a ref to ensure no endless loop is caused by the `useEffect` hook.
   */
  const onStreamEndRef = useRef(onStreamEnd)

  /**
   * This is a ref to the timer that is used to determine if the stream is finished.
   */
  const abortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * This is a ref to the previous index. This is used to determine if the index has changed.
   * Omitting this will cause some characters to be re-typed since the index might be the same if the `text` dependency
   * was changed in the `useEffect` hook.
   */
  const prevIndexRef = useRef(-1)

  // The state representing the text that's being received from the stream
  const [text, setText] = useState('')
  // The text that's currently being typed, this is what's rendered
  const [currentText, setCurrentText] = useState('')
  // The index of the current character being typed
  const [currentIndex, setCurrentIndex] = useState(0)

  /**
   * Populates the text ref with the text from the stream by iterating over it.
   * Does not cause a re-render.
   */
  const populateTextRef = useCallback(async () => {
    console.debug('Reading the stream...')
    for await (const chunk of stream) {
      const delta = chunkAccessor ? chunk[chunkAccessor] : chunk
      setText((prev) => prev + delta)
      if (!firstChunkReceivedRef.current) {
        console.debug(
          'First chunk received. Setting firstChunkReceivedRef to true.'
        )
        firstChunkReceivedRef.current = true
      }
    }
    console.debug(
      'Finished reading the stream. Setting isStreamFinishedRef to true'
    )
    isStreamFinishedRef.current = true
    if (onStreamEndRef.current) {
      console.debug('Calling onStreamEndRef...')
      onStreamEndRef.current()
    }
  }, [stream, chunkAccessor])

  /**
   * The effect response for calling the populate function.
   * Should only be called once.
   */
  useEffect(() => {
    populateTextRef()
  }, [populateTextRef])

  /**
   * Actually handles the typing. This continuously calls itself until the typing of the text is finished.
   */
  useEffect(() => {
    console.debug('Text or index updated. Typing the next character...')
    let timeout: ReturnType<typeof setTimeout>
    let abort = abortTimerRef.current

    // If earlyStop is set and if the stream is finished, early stop by calling the onTypingEnd callback with the full text.
    if (
      earlyStop &&
      firstChunkReceivedRef.current &&
      isStreamFinishedRef.current
    ) {
      console.debug(
        'Stream is already finished and early stop is set to true. Calling onTypingEndRef...'
      )
      onTypingEndRef.current!(text) // This is safe since we check for the callback above
      return
    }

    // If the current index is less than the text length, type the next character after a delay.
    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        // Index is the same, this was most likely caused by the `text` dependency update, skip
        if (prevIndexRef.current === currentIndex) {
          return
        }

        // Index updated, update the previous index ref
        setCurrentIndex((prevIndex) => prevIndex + 1)
        prevIndexRef.current = currentIndex

        // Type the next character
        setCurrentText((prevText) => prevText + text[currentIndex])

        // TODO: Update to use this logic instead:
        // - If user is already at the bottom (ref is visible) then scroll
        // if (continuousScroll) {
        //   scrollTargetRef.current?.scrollIntoView({ behavior: 'auto' });
        // }
      }, delay)
      return
    }

    // If the current index is equal to the text length then, either:
    // 1. First chunk was not received yet, this means that the stream is still loading.
    // 2. We are done typing.
    // 3. Or the stream reached the end.
    //
    // We wait for one second for the stream to receive any additional data.
    // If no additional data is received, then we are done typing.
    console.debug(
      `Cursor reached the text length. Waiting for ${abortDelay} ms before calling onTypingEndRef if first chunk was received...`
    )
    abort = setTimeout(() => {
      if (!firstChunkReceivedRef.current) {
        console.debug(
          'No first chunk was received yet, this means that the stream is most likely still loading. Skipping onTypingEndRef for this iteration.'
        )
        return
      }

      // Call the onTypingEnd callback if any
      console.debug('Finished typing.')
      if (onTypingEndRef.current) {
        console.debug('Calling onTypingEndRef...')
        onTypingEndRef.current(text)
      }
    }, abortDelay)

    return () => {
      // Clear the timeout just in case we have one from the previous render.
      clearTimeout(timeout)
      // This guarantees that the abort timer is cleared as soon as the text or index is updated.
      if (abort) clearTimeout(abort)
    }

    // relevant dependencies are the text and the index
  }, [text, currentIndex, earlyStop, delay, abortDelay])

  return (
    <>
      {Wrapper ? <Wrapper text={currentText} /> : <span>{currentText}</span>}
      {/* <div ref={scrollTargetRef} /> */}
    </>
  )
}
