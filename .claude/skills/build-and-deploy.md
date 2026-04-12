# Build & Deploy

## NPM Scripts

```bash
npm run dev         # webpack-dev-server (port 3002, auto-opens browser)
npm run start       # webpack-dev-server (default port, auto-opens)
npm run build       # Production build → dist/
npm run admintools  # Admin tool server (port 3005)
```

## Webpack Configuration (`webpack.config.js`)

```
Entry:       ./src/index.js
Output:      dist/bundle.[contenthash].js
DevServer:   port 3005 (config default), overridden to 3002 in package.json
HTML:        public/index.html (HtmlWebpackPlugin)
Static:      public/ → dist/ (CopyWebpackPlugin)
```

### Supported File Types
| Extension | Loader |
|-----------|--------|
| `.js`, `.jsx` | babel-loader (preset-env + preset-react) |
| `.css` | style-loader → css-loader → postcss-loader |
| `.json` | Built-in json loader |
| `.png`, `.jpg`, `.svg` | asset/resource → `images/[name][ext]` |

## Environment Variables

### `.env.local` (Local Development)
```
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxx
FIREBASE_STORAGE_BUCKET=xxx.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=xxx
FIREBASE_APP_ID=xxx
```

### Vercel Production
- Set the same variables in Vercel Dashboard > Settings > Environment Variables
- `webpack.DefinePlugin` replaces `process.env.*` with actual values
- `.env.local` is loaded via `dotenv` locally only; Vercel injects platform vars

## Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],  // Scans all JS/JSX inside src/
  theme: { extend: {} },
  plugins: [],
}

// postcss.config.js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} }
}
```

## Vercel Deployment Configuration

```json
// vercel.json
{
  "buildCommand": "npx webpack --mode production",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| `Module not found` | Wrong import path | Check relative path from `src/` |
| Tailwind classes not applied | Content path missing | Verify `tailwind.config.js` content array |
| Env var undefined | `.env.local` missing | Check file exists & variable names |
| Port conflict | Previous process still running | Run `npx kill-port 3002` then restart |
