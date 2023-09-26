import * as React from 'react';
import { AsyncTypewriter, getIterableStream } from '../../dist';

interface ChunkType {
  content: string;
  num: number;
}

interface JsonExampleProps {
  chunksAmount: number;
}

export const JsonExample = ({ chunksAmount }: JsonExampleProps) => {
  const [stream, setStream] = React.useState<AsyncIterable<ChunkType> | null>(
    null
  );

  React.useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch(
        `http://localhost:5000/stream/json?chunks_amount=${chunksAmount}`
      );

      if (response.status !== 200) {
        console.error('Request failed');
        return;
      }

      if (!response.body) {
        console.error('Request returned no body');
        return;
      }

      const stream = getIterableStream<ChunkType>(response.body, JSON.parse, {
        splitRegExp: /(?<=})\n\ndata: (?={)/,
        replaceRegExp: /^data: /,
      });
      setStream(stream);
    };

    fetchStream();
  }, []);

  return (
    <article>
      <h1>AsyncTypewriter - Json Example</h1>
      {stream && (
        <AsyncTypewriter
          stream={stream}
          chunkAccessor="content"
          delay={10}
          Wrapper={({ text }) => <p style={{ margin: '5px 0' }}>{text}</p>}
        />
      )}
    </article>
  );
};
