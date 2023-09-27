import { JsonExample } from './components/JsonExample'
import { TextExample } from './components/TextExample'

function App() {
  return (
    <main>
      <TextExample chunksAmount={50} />
      <JsonExample chunksAmount={50} />
    </main>
  )
}

export default App
