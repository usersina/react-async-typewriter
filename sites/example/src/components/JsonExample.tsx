import {
  AsyncTypewriter,
  getIterableJsonStream,
} from '@usersina/react-async-typewriter'
import * as React from 'react'

interface ChunkType {
  content: string
  num: number
}

interface JsonExampleProps {
  chunksAmount: number
}

export const JsonExample = ({ chunksAmount }: JsonExampleProps) => {
  const [text, setText] = React.useState<string | null>(null)
  const [stream, setStream] = React.useState<AsyncIterable<ChunkType> | null>(
    null
  )

  React.useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch(
        `http://localhost:5000/stream/json?chunks_amount=${chunksAmount}`
      )

      if (response.status !== 200) {
        console.error('Request failed')
        return
      }

      if (!response.body) {
        console.error('Request returned no body')
        return
      }

      const stream = getIterableJsonStream<ChunkType>(response.body)
      setStream(stream)
    }

    fetchStream()
  }, [chunksAmount])

  const handleTypingEnd = (message: string) => {
    console.log('Finished typing, setting stream to null')
    setStream(null)
    setText(message)
  }

  return (
    <article className="text-black">
      <h1 className="font-semibold">AsyncTypewriter - Json Example</h1>
      {stream && (
        <AsyncTypewriter
          stream={stream}
          chunkAccessor="content"
          onStreamEnd={() => console.log('JsonExample: Stream ended')}
          onTypingEnd={handleTypingEnd}
          earlyStop
          delay={10}
          Wrapper={({ text }) => (
            <div className="m-1 max-h-28 overflow-auto">
              <p>{text}</p>
            </div>
          )}
        />
      )}
      {text && (
        <div className="m-1">
          <p className="text-gray-500">
            Stream is null, full text is displayed below
          </p>
          <p>{text}</p>
        </div>
      )}
    </article>
  )
}
