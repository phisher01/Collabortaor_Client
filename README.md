## Collaborator Client

Next.js client application for the Collaborator task board, built with the App Router and React.

### Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4

---

### Project structure (high level)

- **`src/app`**: App Router pages (`/`, `/login`, `/register`, `/board`)
- **`src/components`**: Reusable UI components (e.g. `TaskCard`, `InitialsBadge`)
- **`src/contexts`**: React context providers (e.g. auth)
- **`src/lib/api.ts`**: API helper used for all HTTP calls

---

### Environment configuration

The client talks to a backend API using an environment variable, with sensible defaults.

- **Env file**: create `./.env.local` in the project root.
- **Variables**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Notes:

- **`NEXT_PUBLIC_API_URL`** is optional – if it is **not** set:
  - In **development**, the client defaults to `http://localhost:3000`.
  - In **production**, the client defaults to `https://collabortaor-server.onrender.com`.
- You can override this in any environment by setting `NEXT_PUBLIC_API_URL`.

---

### Scripts

All commands are run from the project root (`client` directory).

- **Install dependencies**

```bash
npm install
```

- **Run development server**

```bash
npm run dev
```

By default this starts Next.js on **http://localhost:3001**.

- **Build for production**

```bash
npm run build
```

- **Start production server**

```bash
npm run start
```

Runs the compiled app (after `npm run build`).

- **Lint**

```bash
npm run lint
```

---

### How to run the app locally

1. **Clone the repo** and move into the client folder:

   ```bash
   git clone <your-repo-url>
   cd client
   ```

2. **Create env file**:

   ```bash
   copy NUL .env.local  # Windows
   ```

   Then open `.env.local` and set at least:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start the dev server**:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:3001** in your browser.

Ensure your backend API is running at the URL you configured in `NEXT_PUBLIC_API_URL` (or at the default).

---

### Production notes

- In most hosted environments, set `NEXT_PUBLIC_API_URL` as an environment variable in your hosting provider’s dashboard.
- If you rely on the built‑in defaults, make sure the backend is reachable at:
  - `https://collabortaor-server.onrender.com` (production), or
  - `http://localhost:3000` (development).

