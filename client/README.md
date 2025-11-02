# Frontend (Vite + React)

This is a minimal React + Vite app (JavaScript) intended to test the CRUD API endpoints in the `server/` folder.

How to run:

1. Install dependencies in the frontend folder:

```bash
cd frontend
npm install
```

2. Start the frontend dev server:

```bash
npm run dev
```

By default the frontend assumes the API is at `http://localhost:3000/api`. If your server uses a different address, set the Vite env variable `VITE_API_BASE` when running the dev server.

Example:

```bash
VITE_API_BASE=http://localhost:3000/api npm run dev
```
