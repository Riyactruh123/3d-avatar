# Backend (digital-human-backend)

Quick notes for running the backend and using Mistral or OpenAI.

Setup

- Copy `.env.example` to `.env` and fill in your keys.

Run (development)

```bash
cd apps/backend
yarn install
# Example (uses Mistral if MISTRAL_API_KEY is set in .env)
yarn dev
```

Testing the TTS / chat endpoint

1. Start the server (see Run above).
2. Send a POST to the endpoint used by the frontend (default in `server.js`). For example:

```bash
curl -X POST http://localhost:3001/api/ai -H "Content-Type: application/json" \
  -d '{"question":"Hello from test"}'
```

Notes
- If `MISTRAL_API_KEY` is present the backend will call Mistral's inference API. Otherwise it falls back to OpenAI via LangChain.
- The backend attempts retries on rate limits and logs quota errors with guidance.
