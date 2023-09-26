import 'react-app-polyfill/ie11';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { JsonExample } from './components/JsonExample';
import { TextExample } from './components/TextExample';

const App = () => {
  return (
    <div>
      <TextExample chunksAmount={50} />
      <JsonExample chunksAmount={50} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
