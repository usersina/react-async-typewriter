import 'react-app-polyfill/ie11';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AsyncTypewriter, getIterableStream } from '../.';

const App = () => {
  const [stream, setStream] = React.useState<AsyncIterable<string> | null>(
    null
  );

  React.useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch(
        'http://localhost:5000/stream?chunks_amount=50'
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
    <div>
      <h1>AsyncTypewriter</h1>
      {stream && <AsyncTypewriter stream={stream} />}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
