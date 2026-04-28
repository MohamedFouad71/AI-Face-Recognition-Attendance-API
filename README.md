# Express API server for the AI Face Recognition Attendance system.

---

## Prerequisites

- **Node.js v24** — Download from [nodejs.org](https://nodejs.org)
  - To check your version, run: `node -v`
  - If you use [nvm](https://github.com/nvm-sh/nvm), just run `nvm use` in this folder and it will pick up the correct version automatically.

---

## Getting Started

```bash
# 1) install dependencies
npm install
# 2) rename .env.example to .env
cp .env.example .env
# 3) run the server in development mode
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

## Contribution

- This repo automatically runs tests before each commit to keep the repository clean, if you faced any problem after
  using the command `git commit`, Do not panic, just use `npm run format` and `npm run lint:fix`, you may also check type
  errors in you code.

- if there you have faced any problem, please feel free to contact me at mohamed.fouad.softwareengineer@gmail.com
