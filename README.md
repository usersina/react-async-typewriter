# React Asynchronous Typewriter

> An asynchronous react typewriter that handles streams

Large Language Models can take quite a bit of type to generate the response, hence most API services tend to provide streaming endpoints to return the data as soon as it's being generated.

This library is a way to get the response stream from a fetch request returning `text/event-stream` as `Content-type` and directly type the chunks from it.

## Getting started

### Installation

```bash
npm i @usersina/react-async-typewriter
```

```bash
yarn add @usersina/react-async-typewriter
```

### Basic Usage

```tsx
import React from 'react'
import {
  AsyncTypewriter,
  getIterableStream,
} from '@usersina/react-async-typewriter'

const MyComponent = () => {
  const [stream, setStream] = React.useState<AsyncIterable<string> | null>(null)

  React.useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch('/streaming/endpoint')
      if (response.status !== 200) return
      if (!response.body) return

      const stream = getIterableStream(response.body)
      setStream(stream)
    }

    fetchStream()
  }, [])

  return (
    <div className="App">{stream && <AsyncTypewriter stream={stream} />}</div>
  )
}
```

- See the [TextExample](./example/components/TextExample.tsx) for an endpoint example.
- Also see the [express server](./example/server/index.mjs) used to test a streaming endpoint.

### Advanced Usage

If the stream returns a custom json, we can further type it per sub-chunk.
Additionally, sub-chunking is done based on specific regular expressions that should be provided.

Here's an example:

- Having an express server with the following `/stream/json` output

```bash
curl -N http://localhost:5000/stream/json\?chunks_amount\=5
data: {"content":"forgot ","num":1}

data: {"content":"child ","num":2}

data: {"content":"dawn ","num":3}

data: {"content":"begun ","num":4}

data: {"content":"chair ","num":5}

```

- Here's the pseudo-code on how to parse each chunk to a specific type:

```tsx
interface ChunkType {
  content: string
  num: number
}

const response = await fetch(
  'http://localhost:5000/stream/json?chunks_amount=50'
)

const stream = getIterableStream<ChunkType>(response.body, JSON.parse, {
  splitRegExp: /(?<=})\n\ndata: (?={)/,
  replaceRegExp: /^data: /,
})

;<AsyncTypewriter
  stream={stream}
  chunkAccessor="content"
  delay={10}
  Wrapper={({ text }) => <p style={{ margin: '5px 0' }}>{text}</p>}
/>
```

- Note that the reason we do sub-chunking is because sometimes chunks tend to overlap when read from the client.
- This might not be critical for text only responses but it is the case for parse-able results, such as the json type above.
- See the [`JsonExample`](./example/components/JsonExample.tsx) for the full example

## Component Props

This lists all possible props of [**`AsyncTypewriter`**](./src/components/AsyncTypewriter.tsx)

| Prop            |               Type                | Options  | Description                                                                                                                                                            | Default |
| --------------- | :-------------------------------: | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| `stream`        |     AsyncIterable<T = string>     | Required | The stream to read and type from. Default type `T` is a string.                                                                                                        |   `-`   |
| `chunkAccessor` |              keyof T              | Optional | If a type `T` is provided, this helps getting the text out of the chunk                                                                                                |   `-`   |
| `delay`         |              number               | Optional | The delay between typing each character in milliseconds                                                                                                                |  `20`   |
| `abortDelay`    |              number               | Optional | The time to wait before calling the `onTypingEnd` callback in milliseconds. Increasing this value guarantees that slow streams will have enough time to finish typing. | `1000`  |
| `onTypingEnd`   |     (message: string) => void     | Optional | Callback for when the message finishes typing. Note that the stream can be closed before the message finishes typing                                                   |   `-`   |
| `onStreamEnd`   |     (message: string) => void     | Optional | Callback for when the stream ends                                                                                                                                      |   `-`   |
| `Wrapper`       | React.ElementType<{text: string}> | Optional | The wrapper element to wrap the typed text in                                                                                                                          | `span`  |

## Function parameters

This lists all possible parameters of [**`getIterableStream`**](./src/utils/streaming.ts)

| Parameter |                      Type                       | Options  | Description                                                                                                                                                                                                                                   | Default |
| --------- | :---------------------------------------------: | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| `body`    |           ReadableStream\<Uint8Array>           | Required | The `ReadableStream` stream to iterate over. This is usually the `body` property of a `Response` object                                                                                                                                       |   `-`   |
| `parser`  |              (chunk: string) => T               | Optional | The function used to parse each chunk (or sub-chunk if `chunkSplitter`) is used to the `T` type. Useful if you want to type the stream result                                                                                                 |   `-`   |
| `stream`  | { splitRegExp: RegExp; replaceRegExp: RegExp; } | Optional | The regular expressions used to further split each chunk into sub-chunks. This is useful since different chunks from a streaming endpoint can be considered as a single chunks in the client hence breaking any parsing done on a chunk-basis |   `-`   |

## Development

Once you clone the repository, install the dependencies and run the `start` script from the root

```bash
yarn install && yarn start
```

This will run the following applications:

- The [**library**](./packages/react-async-typewriter/) in watch mode
- An [**express server**](./sites/server/) at <http://localhost:5000>
- An [**example frontend**](./sites/example/) that uses the library at <http://localhost:3000>
