# Chatbot

A web chatbot with **FastAPI** backend, **React + MUI** frontend, and swappable AI providers (OpenAI or Ollama).

## Prerequisites

- **Python 3.11+** (local dev)
- **Node.js 22+** (local dev)
- **Docker & Docker Compose** (optional, for containerized run)

## Quick start (local dev)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set OPENAI_API_KEY or switch to Ollama (see below)
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## AI providers

### OpenAI (cloud)

In `backend/.env`:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-your-key-here
```

### Ollama (local, no API key)

1. Install [Ollama](https://ollama.com) and pull a model:

   ```bash
   ollama pull llama3.2
   ```

2. In `backend/.env`:

   ```env
   AI_PROVIDER=ollama
   AI_MODEL=llama3.2
   OLLAMA_BASE_URL=http://localhost:11434
   ```

3. Restart the backend. No `OPENAI_API_KEY` needed.

---

## Docker Compose

Runs the API and frontend in containers. Open **http://localhost:8080**.

### Setup

```bash
cp .env.example .env
# Edit .env with your AI provider settings
docker compose up --build
```

| Service  | URL                     | Port |
|----------|-------------------------|------|
| Frontend | http://localhost:8080   | 8080 |
| API      | http://localhost:8000   | 8000 |
| API docs | http://localhost:8000/docs | 8000 |

### Ollama on your machine + Docker API

Use Ollama installed on your host (default in `.env.example`):

```env
AI_PROVIDER=ollama
AI_MODEL=llama3.2
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

Pull the model on your host first: `ollama pull llama3.2`

### Ollama inside Docker

```bash
docker compose --profile ollama up --build
```

In `.env`:

```env
AI_PROVIDER=ollama
AI_MODEL=llama3.2
OLLAMA_BASE_URL=http://ollama:11434
```

Then pull the model inside the container:

```bash
docker compose exec ollama ollama pull llama3.2
```

---

## Project structure

```
chatbot/
├── backend/          # FastAPI + SQLAlchemy + AI providers
├── frontend/         # React + MUI + Vite
├── docker-compose.yml
├── REQUIREMENTS.md
└── PLAN.md
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET/POST | `/api/conversations` | List / create conversations |
| GET/PATCH/DELETE | `/api/conversations/{id}` | Get / rename / delete |
| POST | `/api/conversations/{id}/chat` | Send message (SSE stream) |
