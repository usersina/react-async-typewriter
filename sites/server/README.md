# Server Example

This is a very simple express server that includes two streaming endpoints

- Text in a stream

```bash
curl -N http://localhost:5000/stream/text\?chunks_amount\=50
```

- Text in json-encodable chunks

```bash
curl -N http://localhost:5000/stream/json\?chunks_amount\=50
```
