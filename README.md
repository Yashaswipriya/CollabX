# CollabX — Real-Time Collaborative Workspace

A full-stack real-time collaborative workspace where multiple authenticated users can join shared workspaces, edit documents simultaneously, and see live cursors and user presence.

> **Live Demo:** [your-demo-link.vercel.app](https://collab-x-henna.vercel.app/) 

---

## What It Does

- **Real-time document editing** — multiple users edit the same workspace simultaneously with instant sync
- **Live cursor tracking** — see where other users are in the document in real time
- **Presence system** — know how many are online in your workspace at any moment and who left or joined at the moment
- **Block-based document model** — documents are composed of discrete blocks (like Notion), not raw text files
- **Invite-based access** — workspace owners generate invite links; only invited users can join
- **JWT Authentication** — secure stateless auth with protected routes

---

## Tech Stack

### Frontend
- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- Native **WebSocket API** (browser)

### Backend
- **Node.js** + **Express**
- **PostgreSQL** — relational data, workspace/block/membership schema
- **Redis** (Pub/Sub) — enables multi-instance WebSocket event propagation
- **WebSockets** (`ws` library) — room-based real-time architecture
- **JWT** — stateless authentication

---

## Architecture Overview

```
Client (Next.js)
    │
    ├── REST API ──────────────► Express Server
    │   (auth, workspaces,             │
    │    blocks, invites)              ├── PostgreSQL (persistent data)
    │                                  │
    └── WebSocket ───────────► WS Room Manager
        (real-time events)             │
                                       └── Redis Pub/Sub
                                           (cross-instance broadcast)
```

### WebSocket Room System

Each workspace is a **logical room**. When a user connects:
1. Client sends `JOIN_ROOM` with `workspaceId`
2. Server assigns the socket to that room
3. All subsequent events are scoped to that room only — no cross-workspace leakage

**Supported events:**
| Event | Description |
|---|---|
| `BLOCK_CREATED` | New block added to document |
| `BLOCK_UPDATED` | Block content changed |
| `BLOCK_DELETED` | Block removed |
| `USER_JOINED` | User entered workspace |
| `USER_LEFT` | User disconnected |
| `CURSOR_MOVE` | Live cursor position update (throttled) |

### Redis Pub/Sub

WebSocket events are published to Redis and broadcast to all subscribed backend instances — making the system horizontally scalable beyond a single server.

### Block-Based Document Model

Instead of syncing entire documents, only individual blocks are synced. Each block has:
- `id`, `position`, `content`, `version`

Versioning prevents stale overwrites. This reduces payload size.

---

## Database Schema (simplified)

```
users
  id, email, password_hash, created_at

workspaces
  id, name, owner_id, created_at

workspace_memberships
  workspace_id, user_id, joined_at

blocks
  id, workspace_id, content, position, version, created_at

invite_tokens
  id, workspace_id, token, created_by, created_at
```

---


## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Hosted PostgreSQL |
| Redis | Render Key Value |

WebSocket protocol is environment-aware:
- Local: `ws://`
- Production: `wss://`

CORS is configured to allow only the deployed frontend domain in production.

---
