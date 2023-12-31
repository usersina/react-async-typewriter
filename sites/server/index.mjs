import cors from 'cors'
import express from 'express'
import { resolve } from 'path'
import { generate } from 'random-words'

const app = express()
const PORT = 5000

/**
 * Wait for ms milliseconds
 * @param {number} ms
 */
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

app.use(cors())

app.get('/', (_req, res) => {
  // render the html page
  res.sendFile(resolve() + '/index.html')
})

// See https://stackoverflow.com/questions/34657222/how-to-use-server-sent-events-in-express-js
app.get('/stream/text', (req, res) => {
  const chunks_amount = parseInt(req.query?.chunks_amount) || 500

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  })

  let counter = 0
  let interValID = setInterval(() => {
    counter++
    if (counter >= chunks_amount) {
      clearInterval(interValID)
      res.end() // terminates SSE session
      return
    }
    console.log('Iteration', counter)
    res.write(generate() + ' ') // res.write() instead of res.send()
  }, 10)

  // If client closes connection, stop sending events
  res.on('close', () => {
    console.log('client dropped connection')
    clearInterval(interValID)
    res.end()
  })
})

app.get('/stream/json', (req, res) => {
  const chunks_amount = parseInt(req.query?.chunks_amount) || 500

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-ndjson',
  })

  let counter = 0
  let interValID = setInterval(async () => {
    counter++
    if (counter >= chunks_amount) {
      clearInterval(interValID)
      res.end() // terminates SSE session
      return
    }
    console.log('Iteration', counter)
    await wait(100)
    res.write(
      JSON.stringify({ content: generate() + ' ', num: counter }) + '\n'
    ) // res.write() instead of res.send()
  }, 100)

  // If client closes connection, stop sending events
  res.on('close', () => {
    console.log('client dropped connection')
    clearInterval(interValID)
    res.end()
  })
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
