# Pointing Poker 🐱

A real-time planning poker app for agile teams. Host a session, share a link, and estimate together.

## Features

- **Real-time sync** via WebRTC (PeerJS) — no server needed for voting
- **Multiple card decks** — Fibonacci, T-shirt sizes, or custom
- **Auto-reveal** — automatically show votes when everyone's in
- **Countdown timer** — keep estimation sessions on track
- **Vote stats** — pie chart breakdown + recommended estimate
- **ClickUp links** — paste ticket URLs and they become clickable
- **Throw cats** — click non-voters to hurl animated cats at them

## Quick Start

```bash
npm install

# Start local PeerJS server (required for WebRTC signaling)
npm run serve

# In another terminal, start the app
npm start
```

Open http://localhost:5173, create a session, and share the join link.

## Debug Mode

Test without real participants:

```bash
npm run start:debug:host        # Host view with mock participants
npm run start:debug:participant # Participant view with mock host
```

## Tech Stack

React 19 • TypeScript • Vite • Tailwind CSS • PeerJS • Framer Motion

---

## Additional Info

### Miro

Miro board Thunder TEAM here https://miro.com/app/board/uXjVJq8ddWU=/

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
