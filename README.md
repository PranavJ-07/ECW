# EthiCraft

**College Club & Event Management Platform** — a multi-tenant SaaS for managing campus clubs, events, registrations, attendance, certificates, budgets, and analytics.

One React dashboard adapts to each user's role: **student**, **faculty**, **club officer**, or **college admin**.

---

## Features

| Module | Description |
|--------|-------------|
| **Auth** | Register, login, JWT sessions, role-based permissions |
| **Events** | Create, publish, cancel, browse campus events |
| **Registrations** | Register, waitlist, cancel, officer check-in |
| **Clubs** | Create and manage clubs; officer & admin views |
| **Analytics** | College, club, and event dashboards |
| **Certificates** | Issue, verify, and view participation certificates |
| **Notifications** | In-app inbox with unread counts |
| **Budget** | Club budgets and expense tracking (API + partial UI) |
| **QR Attendance** | Generate and scan attendance QR codes (API only) |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite, MUI 9, React Router 7, Axios |
| **Backend** | Node.js 20+, Express 5, TypeScript, Mongoose, Zod |
| **Database** | MongoDB (local or Atlas) |
| **Auth** | JWT (Bearer tokens) |

---

## Project Structure

```
EC/
├── client/          # React SPA (Vite)
│   └── src/
│       ├── api/         # Axios API clients
│       ├── components/  # Shared UI, layout, role-specific widgets
│       ├── config/      # Navigation, routing helpers
│       ├── context/     # Auth & theme providers
│       ├── pages/       # Route pages (student, faculty, club, admin)
│       └── routes/      # App routing
│
└── server/          # Express API
    └── src/
        ├── application/     # Use cases & services
        ├── domain/          # Entities, interfaces, errors
        ├── infrastructure/  # MongoDB repos, email, logger
        └── presentation/    # HTTP routes, controllers, middleware
```

---

## Prerequisites

- **Node.js** ≥ 20
- **MongoDB** — local install, MongoDB Compass, or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier works)
- **npm**

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd EC

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

**Server** — copy and edit:

```bash
cp server/.env.example server/.env
```

Required variables:

```env
MONGODB_URI=mongodb://localhost:27017/ethicraft
JWT_ACCESS_SECRET=change-me-to-a-long-random-string-min-32-chars
CLIENT_URL=http://localhost:5173
PORT=3000
```

For **MongoDB Atlas**, use your Atlas connection string and include a database name:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/ethicraft
```

**Client** — copy and edit:

```bash
cp client/.env.example client/.env
```

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

> Restart the Vite dev server after changing client env vars.

### 3. Seed a demo college

```bash
cd server
npm run seed
```

This creates college slug **`mit`** with allowed email domain **`mit.edu`**.

> MongoDB must be running and reachable before seeding. The database is created automatically on first write — you do not need to create it manually.

### 4. Run the apps

**Terminal 1 — API:**

```bash
cd server
npm run dev
```

API: `http://localhost:3000`  
Health check: `http://localhost:3000/health`

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

App: `http://localhost:5173`

### 5. Create an account

1. Open `http://localhost:5173/register`
2. **College slug:** `mit`
3. **Email:** must end with `@mit.edu` (e.g. `student@mit.edu`)
4. **Password:** min 8 chars, uppercase, lowercase, and digit (e.g. `Password1`)

Sign in at `/login` with the same credentials.

---

## Roles & Dashboards

| Role | Dashboard | Key capabilities |
|------|-----------|------------------|
| `student` | Student overview | Browse/register events, certificates, notifications |
| `faculty` | Faculty overview | Browse clubs, view advised clubs, read-only events |
| Club officer | Club dashboard | Manage club events, registrations, budget (via membership) |
| `college_admin` | Admin overview | Analytics, manage clubs, all campus events |

### Promote a user to college admin (dev)

New registrations default to `student`. To test the admin dashboard, update the user in MongoDB (Compass, mongosh, or Atlas UI):

```javascript
db.users.updateOne(
  { email: "your-email@mit.edu" },
  { $set: { roles: ["college_admin"] } }
)
```

Sign out and sign back in for the new role to take effect.

---

## Frontend Routes

| Path | Who | Purpose |
|------|-----|---------|
| `/dashboard` | All | Role-based home |
| `/dashboard/events` | Students, faculty, admin | Browse campus events |
| `/dashboard/events/:slug` | All with access | Event details & registration |
| `/dashboard/my-events` | Students | My registrations |
| `/dashboard/certificates` | Students | My certificates |
| `/dashboard/notifications` | All | Notification inbox |
| `/dashboard/clubs` | Club officers | Pick a club to manage |
| `/dashboard/clubs/:slug/*` | Club officers | Overview, events, budget |
| `/dashboard/browse-clubs` | Faculty | Browse all clubs |
| `/dashboard/advised-clubs` | Faculty | Clubs they advise |
| `/dashboard/analytics` | College admin | Full college analytics |
| `/dashboard/admin/clubs` | College admin | Manage & create clubs |
| `/dashboard/admin/events` | College admin | All campus events |

---

## API Overview

Base URL: `http://localhost:3000/api/v1`

All tenant-scoped routes use the pattern:

```
/colleges/:collegeSlug/...
```

| Area | Example endpoints |
|------|-------------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Events | `GET /colleges/:slug/events`, `POST .../events/:slug/publish` |
| Registrations | `POST .../events/:slug/register`, `GET .../users/me/registrations` |
| Clubs | `GET/POST /colleges/:slug/clubs` |
| Analytics | `GET /colleges/:slug/analytics/overview` |
| Certificates | `GET .../users/me/certificates` |
| Notifications | `GET .../users/me/notifications` |
| Budget | `GET .../clubs/:clubSlug/budgets` |
| Attendance | `POST .../events/:slug/attendance/qr` |

Authenticated requests require:

```
Authorization: Bearer <accessToken>
```

---

## Scripts

### Server (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm test` | Run unit tests (97 tests) |
| `npm run seed` | Seed demo college (`mit`) |

### Client (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |

---

## Architecture Notes

- **Multi-tenant:** Each college is isolated by `collegeSlug`. Users belong to one college.
- **Clean architecture (server):** Domain → application (use cases) → infrastructure → presentation (HTTP).
- **Permissions:** Roles map to granular permissions (e.g. `events:register`, `analytics:read`). The frontend gates routes and nav items by permission.
- **Express 5:** Request validation merges parsed query/params in place (read-only getters).

---

## Not Yet Built (UI)

- QR attendance scanner
- Certificate issue/revoke from frontend
- Full expense approval workflow
- Club membership join/approve
- User management admin page
- Announcements
- Public marketing / landing page

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Seed hangs or `ECONNREFUSED` | Start MongoDB or fix `MONGODB_URI` |
| CORS errors | Set `CLIENT_URL=http://localhost:5173` in `server/.env` |
| Dashboard shows API error | Ensure server is running on port 3000 |
| `College not found` on register | Run `npm run seed` in `server/` |
| `Email domain not allowed` | Use an email matching the college's allowed domains |
| Admin dashboard not showing | Set `roles: ["college_admin"]` in MongoDB, then re-login |
| Can't find user in Compass | Check the correct database (match `MONGODB_URI` path) |

---

## License

ISC
