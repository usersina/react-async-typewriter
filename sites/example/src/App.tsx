import { useState } from 'react'
import { JsonExample } from './components/JsonExample'
import { TextExample } from './components/TextExample'

function App() {
  const [selectedExample, setSelectedExample] = useState<'text' | 'json'>(
    'text'
  )

  return (
    <main className="p-4 text-white">
      <div className="mb-4">
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            className="form-radio text-blue-600"
            checked={selectedExample === 'text'}
            onChange={() => setSelectedExample('text')}
          />
          <span className="ml-2">Text Example</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            checked={selectedExample === 'json'}
            onChange={() => setSelectedExample('json')}
          />
          <span className="ml-2">JSON Example</span>
        </label>
      </div>
      {selectedExample === 'text' && <TextExample chunksAmount={50} />}
      {selectedExample === 'json' && <JsonExample chunksAmount={50} />}
    </main>
  )
}

export default App
