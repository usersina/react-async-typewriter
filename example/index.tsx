import 'react-app-polyfill/ie11';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { JsonExample } from './components/JsonExample';
import { TextExample } from './components/TextExample';
import './index.css';

const App = () => {
  return (
    <main>
      <TextExample chunksAmount={50} />
      <JsonExample chunksAmount={50} />
    </main>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
