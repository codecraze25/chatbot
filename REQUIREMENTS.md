# Chatbot — Product Requirements

## 1. Overview

A web-based conversational chatbot with a **FastAPI** backend and a **React + MUI** frontend. Users can send messages, receive AI-generated replies (including streaming), and manage conversation history.

### Goals

- Deliver a responsive, accessible chat UI
- Support real-time streaming responses
- Keep the AI provider swappable (not locked to one vendor)
- Be deployable locally for development and to a simple cloud setup for production

### Out of Scope (v1)

- Voice input/output
- Multi-user authentication / SSO
- Fine-tuning custom models
- Mobile native apps
- Plugin/tool-calling agents (can be v2)

---

## 2. Recommended AI Stack

Use a **provider abstraction layer** in the backend so the frontend never talks to an AI vendor directly.

| Layer | Recommendation | Role |
|-------|----------------|------|
| **Orchestration** | [LiteLLM](https://github.com/BerriAI/litellm) or direct SDK calls | Single interface for OpenAI, Anthropic, Ollama, Azure, etc. |
| **Primary provider (dev/prod)** | **OpenAI API** (`gpt-4o-mini` for cost, `gpt-4o` for quality) | Best docs, streaming, reliability |
| **Alternative provider** | **Anthropic Claude** (`claude-sonnet-4-20250514` or latest Sonnet) | Strong long-context and instruction following |
| **Local / offline dev** | **Ollama** (`llama3.2`, `mistral`, `qwen2.5`) | Free, private, no API key for local work |
| **Embeddings (future RAG)** | OpenAI `text-embedding-3-small` or Ollama `nomic-embed-text` | Only needed if you add document Q&A later |

### Why this combination

1. **FastAPI + streaming** — OpenAI and Anthropic both support SSE-style streaming; LiteLLM normalizes this across providers.
2. **Cost control** — Use `gpt-4o-mini` or local Ollama during development; switch via env var.
3. **No frontend AI keys** — API keys stay server-side only.
4. **Upgrade path** — Same backend can add RAG, tools, or agents without rewriting the UI.

### Environment-based provider selection

```env
AI_PROVIDER=openai          # openai | anthropic | ollama
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434
AI_MODEL=gpt-4o-mini        # or claude-sonnet-..., llama3.2, etc.
```

**Recommendation for this project:** Start with **OpenAI `gpt-4o-mini`** + **Ollama** as a local fallback. Add LiteLLM only if you plan to switch providers often.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React + MUI Frontend                                   │
│  - Chat window, message list, input, sidebar              │
│  - Consumes REST + SSE (or WebSocket) from backend      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│  FastAPI Backend                                        │
│  - /api/conversations  CRUD                             │
│  - /api/chat           send message + stream reply      │
│  - /api/health         health check                     │
│  - AI service layer (provider abstraction)              │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
    ┌──────▼──────┐                ┌──────▼──────┐
    │  SQLite /   │                │  AI Provider │
    │  PostgreSQL │                │  OpenAI /    │
    │  (messages) │                │  Ollama /    │
    └─────────────┘                │  Anthropic   │
                                   └─────────────┘
```

### Communication pattern

- **REST** — create/list/delete conversations, load history
- **SSE (Server-Sent Events)** — stream assistant tokens to the UI (simpler than WebSocket for v1)
- Optional **WebSocket** in v2 if you need bidirectional events (typing indicators, cancel mid-stream)

---

## 4. Functional Requirements

### 4.1 Chat

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User can type a message and send it with Enter or a Send button | Must |
| FR-02 | Assistant reply streams token-by-token in the message bubble | Must |
| FR-03 | User can start a new conversation (clears context in UI) | Must |
| FR-04 | Conversation history persists across page refresh | Must |
| FR-05 | User can view a list of past conversations in a sidebar | Must |
| FR-06 | User can delete a conversation | Should |
| FR-07 | User can rename a conversation (auto-title from first message is acceptable for v1) | Should |
| FR-08 | User can stop/cancel an in-progress stream | Should |
| FR-09 | User can copy assistant message text | Should |
| FR-10 | Markdown rendering in assistant messages (code blocks, lists, bold) | Should |
| FR-11 | Display error state when AI provider is unavailable | Must |

### 4.2 Conversations & Messages

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12 | Each conversation has a unique ID, title, created/updated timestamps | Must |
| FR-13 | Messages store role (`user` \| `assistant` \| `system`), content, timestamp | Must |
| FR-14 | Backend sends full conversation context (or last N messages) to the AI on each turn | Must |
| FR-15 | Configurable system prompt (env or admin config, not user-editable in v1) | Should |

### 4.3 Settings (v1 minimal)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-16 | Backend reads model name and provider from environment | Must |
| FR-17 | Optional: UI shows current model name (read-only) | Could |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Time to first token (streaming start) | < 2s on good network |
| NFR-02 | UI responsive layout | Desktop + tablet; mobile usable |
| NFR-03 | Accessibility | MUI defaults + keyboard send, focus management |
| NFR-04 | API keys never exposed to browser | Server-side only |
| NFR-05 | CORS configured for frontend origin only | Dev + prod origins |
| NFR-06 | Rate limiting on chat endpoint | e.g. 30 req/min per IP (v1 simple) |
| NFR-07 | Logging | Request ID, errors, latency (no full message content in prod logs if sensitive) |
| NFR-08 | Local dev setup | `docker compose` or documented steps < 15 min |

---

## 6. Tech Stack (Confirmed)

### Backend

| Component | Choice |
|-----------|--------|
| Framework | FastAPI |
| ASGI server | Uvicorn |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL |
| Validation | Pydantic v2 |
| HTTP client (AI) | `httpx` or official OpenAI/Anthropic SDK |
| Streaming | `StreamingResponse` (SSE) |

### Frontend

| Component | Choice |
|-----------|--------|
| Framework | React 18+ (Vite) |
| UI library | MUI (Material UI) v5/v6 |
| State | React Query (server state) + useState/useReducer (UI) |
| HTTP | `fetch` or axios |
| Streaming | `EventSource` or `fetch` with readable stream |
| Markdown | `react-markdown` + `remark-gfm` |
| Routing | React Router (single `/` page is fine for v1) |

### DevOps (v1)

| Component | Choice |
|-----------|--------|
| Env config | `.env` + `pydantic-settings` |
| Container | Docker Compose (api + db + optional ollama) |
| Lint/format | Ruff (Python), ESLint + Prettier (TS) |

---

## 7. API Contract (Draft)

### Conversations

```
GET    /api/conversations              → list conversations
POST   /api/conversations              → create empty conversation
GET    /api/conversations/{id}         → get conversation + messages
PATCH  /api/conversations/{id}       → update title
DELETE /api/conversations/{id}         → delete conversation
```

### Chat

```
POST   /api/conversations/{id}/chat
       Body: { "message": "Hello" }
       Response: SSE stream
         event: token    data: {"content": "Hi"}
         event: done     data: {"message_id": "..."}
         event: error    data: {"detail": "..."}
```

### Health

```
GET    /api/health                     → { "status": "ok", "provider": "openai" }
```

---

## 8. Data Model (Draft)

### Conversation

- `id` (UUID)
- `title` (string, default "New chat")
- `created_at`, `updated_at`

### Message

- `id` (UUID)
- `conversation_id` (FK)
- `role` (`user` | `assistant` | `system`)
- `content` (text)
- `created_at`

---

## 9. UI Requirements (MUI)

| Area | Description |
|------|-------------|
| **Layout** | AppBar + drawer sidebar (conversation list) + main chat panel |
| **Message list** | Scrollable; auto-scroll on new tokens; user right-aligned, assistant left |
| **Input** | Multiline `TextField`; disabled while streaming |
| **Empty state** | Welcome text + suggested prompts (optional) |
| **Loading** | Typing indicator or skeleton while waiting for first token |
| **Theme** | Light default; dark mode optional (MUI theme toggle) |
| **Errors** | `Snackbar` or inline `Alert` for API/AI failures |

---

## 10. Security Requirements

- API keys in environment variables only
- Validate and sanitize all user input length (e.g. max 8k chars per message)
- SQL injection prevention via ORM parameterized queries
- CORS allowlist
- No storage of API keys in database
- Optional: simple API key header for backend if deployed publicly (v2)

---

## 11. Milestones

### Phase 1 — MVP (target: working demo)

- [ ] FastAPI project scaffold + health endpoint
- [ ] SQLite + conversation/message models
- [ ] OpenAI streaming chat endpoint
- [ ] React + MUI chat UI with SSE consumption
- [ ] New chat + persist history

### Phase 2 — Polish

- [ ] Sidebar conversation list, delete, rename
- [ ] Markdown + code highlighting
- [ ] Cancel stream, copy message
- [ ] Ollama provider support via env switch
- [ ] Docker Compose

### Phase 3 — Optional enhancements

- [ ] User authentication
- [ ] RAG (document upload + embeddings)
- [ ] Tool/function calling
- [ ] Export conversation (JSON/Markdown)

---

## 12. Open Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Auth in v1? | None vs simple API key vs full auth | **None** for local practice; add later |
| Database | SQLite vs PostgreSQL from day 1 | **SQLite** dev, PostgreSQL prod |
| Streaming | SSE vs WebSocket | **SSE** for v1 |
| AI library | Raw SDK vs LiteLLM | **Raw OpenAI SDK** first; LiteLLM when adding 2nd provider |
| Monorepo vs split repos | Single repo with `/backend` `/frontend` | **Monorepo** for this project size |

---

## 13. Success Criteria

1. User can complete a multi-turn conversation with streaming replies
2. Conversations survive browser refresh
3. Switching `AI_PROVIDER` to `ollama` works without frontend changes
4. Project runs locally with documented steps and a single `.env.example`
