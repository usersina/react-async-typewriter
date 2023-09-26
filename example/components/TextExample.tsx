import * as React from 'react';
import { AsyncTypewriter, getIterableStream } from '../../dist';

interface TextExampleProps {
  chunksAmount: number;
}

export const TextExample = ({ chunksAmount }: TextExampleProps) => {
  const [stream, setStream] = React.useState<AsyncIterable<string> | null>(
    null
  );

  React.useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch(
        `http://localhost:5000/stream/text?chunks_amount=${chunksAmount}`
      );

      if (response.status !== 200) {
        console.error('Request failed');
        return;
      }

      if (!response.body) {
        console.error('Request returned no body');
        return;
      }

      const stream = getIterableStream(response.body);
      setStream(stream);
    };

    fetchStream();
  }, []);

  return (
    <article>
      <h1>AsyncTypewriter - Text Example</h1>
      {stream && (
        <AsyncTypewriter
          stream={stream}
          delay={10}
          Wrapper={({ text }) => <p style={{ margin: '5px 0' }}>{text}</p>}
        />
      )}
    </article>
  );
};
