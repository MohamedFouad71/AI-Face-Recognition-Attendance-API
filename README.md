# API

Express API server for the AI Face Recognition Attendance system.

---

## Prerequisites

- **Node.js v24** — Download from [nodejs.org](https://nodejs.org)
  - To check your version, run: `node -v`
  - If you use [nvm](https://github.com/nvm-sh/nvm), just run `nvm use` in this folder and it will pick up the correct version automatically.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and adjust the values if needed:

```bash
cp .env.example .env
```

The default `.env` only needs one variable:

| Variable | Default | Description             |
| -------- | ------- | ----------------------- |
| `PORT`   | `3000`  | Port the server runs on |

### 3. Run the server (development)

```bash
npm run dev
```

Once running, open [http://localhost:3000/health](http://localhost:3000/health) in your browser. You should see:

```json
{ "success": "ok" }
```

---

## Available Scripts

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start the dev server (auto-reload on file changes) |
| `npm run build`    | Compile TypeScript into plain JavaScript (`dist/`) |
| `npm start`        | Run the compiled JavaScript (run `build` first)    |
| `npm test`         | Run tests in watch mode                            |
| `npm run test:run` | Run tests once and exit                            |
| `npm run lint`     | Check code for linting errors                      |
| `npm run lint:fix` | Auto-fix linting errors                            |
| `npm run format`   | Auto-format all files with Prettier                |

---

## Project Structure

```
Api/
├── src/
│   ├── server.ts        # App entry point
│   ├── utils/            # Utility / helper functions
│   └── __tests__/        # Test files  (*.spec.ts)
├── .env.example          # Template for env variables
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── eslint.config.js      # Linting rules
├── vitest.config.js      # Test runner config
└── .prettierrc           # Code formatting rules
```

---
