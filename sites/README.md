# Sites

## Frontend Example

A Vite React application that includes usage examples of the library.

```bash
yarn install
```

```bash
yarn dev
```

## Server Example

This is a very simple express server that includes two streaming endpoints.
You can directly test them in the browser.

- Text in a stream

```bash
curl -N http://localhost:5000/stream/text?chunks_amount=250
```

- Text in json-encodable chunks

```bash
curl -N http://localhost:5000/stream/json?chunks_amount=50
```
