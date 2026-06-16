# Git Sync

A full‑stack application that connects to your **GitHub** account via OAuth, syncs your
organizations, members, repositories, commits, issues and pull requests into **MongoDB**,
and presents everything in a searchable, paginated data grid.

The backend handles the GitHub OAuth handshake, pulls data from the GitHub REST API, and
stores it locally so the frontend can browse and search it fast without hitting GitHub's
rate limits on every request.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Angular 20, Angular Material, AG Grid, RxJS, TypeScript |
| **Backend** | Node.js, Express 5, Passport (`passport-github2`), JWT, Mongoose |
| **Database** | MongoDB |
| **Auth** | GitHub OAuth 2.0 → JWT (1‑day expiry) |

---

## Architecture

```
┌──────────────┐        OAuth redirect         ┌──────────────┐        REST        ┌──────────────┐
│   Angular    │ ───────────────────────────►  │   Express    │ ─────────────────► │  GitHub API  │
│   (client)   │  ◄── JWT + user profile ────   │   (server)   │  ◄── orgs/repos…   │              │
└──────┬───────┘                                └──────┬───────┘                    └──────────────┘
       │  GET /api/github/data (Bearer JWT)            │  sync + store
       └──────────────────────────────────────────────┴──────────────► MongoDB
```

### Flow
1. User clicks **Connect to GitHub** → redirected to GitHub OAuth (`scope: read:org, repo`).
2. GitHub redirects back to the server callback; Passport exchanges the code for an access token.
3. The server upserts the **user** and **GitHub integration** records, then kicks off
   `syncUserData()` to fetch orgs → members → repos → commits → issues → pull requests.
4. The server signs a **JWT** (containing the GitHub access token + username) and returns it.
5. The Angular app stores the JWT and calls `GET /api/github/data` (with a `Bearer` token)
   to browse and search the synced collections in an AG Grid table.

---

## Project Structure

```
git-sync/
├── client/                         # Angular frontend
│   └── src/
│       ├── app/                    # Root module, auth service, guard, interceptor
│       └── gitsync/                # Feature module
│           ├── git-auth/           # "Connect to GitHub" screen
│           ├── git-call-back/      # OAuth callback handler
│           ├── data-viewer/        # AG Grid data browser
│           ├── git.service.ts      # Data fetching + AG Grid column defs
│           └── git.routes.ts       # /github/auth, /callback, /data
│
└── server/                         # Express backend
    ├── app.js                      # Express app, middleware, routes
    ├── server.js                   # Cluster bootstrap + listen
    ├── controllers/auth.controller.js   # createUser, getGithubData (+ search)
    ├── helpers/github.auth.js      # Passport GitHub strategy
    ├── services/github.sync.service.js  # GitHub API → MongoDB sync
    ├── middlewares/                # JWT auth, request logger
    ├── models/                     # Mongoose schemas (user, org, repo, commit, issue, pull…)
    ├── routes/auth.routes.js       # /api/github routes
    ├── db/mongodb.js               # Mongo connection
    └── utills/utils.js             # JWT sign/verify
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+ (Express 5 / Angular 20)
- **MongoDB** running locally or a connection string
- A **GitHub OAuth App** (Settings → Developer settings → OAuth Apps)

### 1. Create a GitHub OAuth App
- **Homepage URL:** `http://localhost:4200`
- **Authorization callback URL:** `http://localhost:3000/api/github/callback`
- Copy the **Client ID** and **Client Secret**.

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` (this file is git‑ignored):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/github-auth
SESSION_SECRET=replace-with-a-long-random-string
JWT_SECRET=replace-with-a-long-random-string
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK=http://localhost:3000/api/github/callback
```

Run the server:

```bash
npm start          # node server.js (clustered)
```

### 3. Frontend setup

```bash
cd client
npm install
npm start          # ng serve on http://localhost:4200
```

The client proxies `/api/*` to `http://localhost:3000` (see `client/proxy.conf.json`),
so make sure `ng serve` is started with that proxy if it isn't picked up automatically.

Open **http://localhost:4200/github/auth** and click **Connect to GitHub**.

---

## API Reference

Base path: `/api/github`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | — | Starts the GitHub OAuth flow (`read:org`, `repo`). |
| `GET` | `/callback` | — | OAuth callback. Creates the user, triggers sync, returns a JWT. |
| `GET` | `/data` | Bearer JWT | Returns paginated/searchable synced data. |

### `GET /api/github/data`

Query parameters:

| Param | Default | Description |
|-------|---------|-------------|
| `collection` | — | One of `orgs`, `repos`, `commits`, `issues`, `pulls`. |
| `page` | `1` | Page number. |
| `limit` | `10` | Items per page. |
| `search` | `''` | Search term. When `collection` is omitted, performs a **global search** across all collections. |

**Auth header:** `Authorization: Bearer <jwt>`

---

## Synced Data Collections

| Collection | Source GitHub endpoint |
|------------|------------------------|
| `orgs` | `/user/orgs` |
| `members` | `/orgs/{org}/members` |
| `repos` | `/orgs/{org}/repos` |
| `commits` | `/repos/{org}/{repo}/commits` (up to ~3000) |
| `issues` | `/repos/{org}/{repo}/issues` (PRs filtered out, up to ~2000) |
| `pulls` | `/repos/{org}/{repo}/pulls?state=all` (up to ~2000) |

All writes use Mongoose `bulkWrite` upserts, so re‑syncing updates existing records
instead of duplicating them.

---

## Notes & Possible Improvements

This is a working prototype. A few things worth hardening before production use:

- **Hardcoded server URL** in `client/.../git-auth/gitu-auth.ts` points at a fixed IP
  (`http://104.168.152.172:3000`). Move this to an Angular environment file so local and
  prod builds use the right backend.
- **Open CORS** (`app.use(cors())`) allows any origin — lock it down to known frontends.
- **Clustering + sessions:** `express-session` uses the default in‑memory store, which is
  not shared across the clustered workers spawned in `server.js`. The OAuth handshake is
  the only session‑dependent step, but a shared store (e.g. Mongo/Redis) is safer.
- **Sync runs inline** on login and isn't awaited; for large accounts consider a background
  job/queue and pagination feedback in the UI.
- `cluster.isMaster` is deprecated on newer Node — prefer `cluster.isPrimary`.
- Minor: typo'd model filename `org.repo.issues.mode.js` and an undeclared `isConnected`
  global in `db/mongodb.js`.

---

## License

ISC
