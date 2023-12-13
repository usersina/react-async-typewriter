# React Asynchronous Typewriter

> An asynchronous react typewriter that handles streams

Large Language Models can take quite a bit of time to generate the full response, hence most API services tend to provide streaming endpoints to return the data as soon as it's being generated (time to first token).

This library is a way to get the response stream from a fetch request returning a stream and parse its result.

## Getting started

### Installation

```bash
npm i @usersina/react-async-typewriter
```

```bash
yarn add @usersina/react-async-typewriter
```

### Text Streaming

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

  return <div>{stream && <AsyncTypewriter stream={stream} />}</div>
}
```

- See the [TextExample](./sites/example/src/components/TextExample.tsx) for an endpoint example.
- Also see the [express server](./sites/server/index.mjs) used to test a streaming endpoint.

### Json Streaming

If the stream returns a json response, we can further parse and type the chunks.

Here's an example:

- Having an express server with the following `/stream/json` output

```bash
curl -N http://localhost:5000/stream/json\?chunks_amount\=5
{"content":"scientist ","num":1}{"content":"your ","num":2}{"content":"anyway ","num":3}{"content":"spin ","num":4}
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

const stream = getIterableStream<ChunkType>(response.body)

<AsyncTypewriter
  stream={stream}
  chunkAccessor="content"
  delay={10}
  Wrapper={({ text }) => <p style={{ margin: '5px 0' }}>{text}</p>}
/>
```

See the [`JsonExample`](./sites/example/src/components/JsonExample.tsx) for an actual implementation.

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

| Parameter |            Type             | Options  | Description                                                                                             | Default |
| --------- | :-------------------------: | -------- | ------------------------------------------------------------------------------------------------------- | :-----: |
| `body`    | ReadableStream\<Uint8Array> | Required | The `ReadableStream` stream to iterate over. This is usually the `body` property of a `Response` object |   `-`   |

This lists all possible parameters of [**`getIterableJsonStream<T>`**](./src/utils/streaming.ts)

| Parameter |            Type             | Options  | Description                                                                                             | Default |
| --------- | :-------------------------: | -------- | ------------------------------------------------------------------------------------------------------- | :-----: |
| `body`    | ReadableStream\<Uint8Array> | Required | The `ReadableStream` stream to iterate over. This is usually the `body` property of a `Response` object |   `-`   |

## Development

### 1. Running the project

Once you fork the repository, install the dependencies and run the `start` script from the root

```bash
yarn install && yarn start
```

This will run the following applications:

- The [**library**](./packages/react-async-typewriter/) in watch mode
- An [**express server**](./sites/server/) at <http://localhost:5000>
- An [**example frontend**](./sites/example/) that uses the library at <http://localhost:3000>

You will see a warning since the example frontend cannot find the library (it's still being built) but navigating
to <http://localhost:3000> should already show the working example.

### Alternatively

You can also only run the library files in watch mode using

```bash
yarn start:package
```

And try out the package in any of your projects by adding this dependency

```json
"dependencies": {
  "@usersina/react-async-typewriter": "link:/absolute/path/to/react-async-typewriter/packages/react-async-typewriter",
}
```

Don't forget to re-run `yarn install` once you add the dependency.

### 2. Submitting a PR

You can then submit a pull request, alongside a commit containing a `changeset` file, see [changesets](https://github.com/changesets/changesets) for more details.
