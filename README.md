# Routewise

Routewise is an AI road trip planning application founded by Pavnoor Singh Grewal.
The local site includes the trip planner and The Story, with streamlined
navigation and responsive layouts.

## Run locally

Use Node.js 20.9 or newer and the pinned pnpm version:

```sh
npx pnpm@10.11.0 install --frozen-lockfile
npm run dev
```

Open http://localhost:3000. The Next.js process serves both the website and its
`/api/chat` backend locally; no Vercel deployment is needed.

For AI trip planning, copy `.env.example` to `.env.local`, fill in your own
`AI_GATEWAY_API_KEY`, then restart the development server. Without a key, the
pages still work and the chat explains how to enable planning.

The AI model itself is accessed through Vercel AI Gateway over the internet; it
does not run offline on your computer.

## Validate

```sh
npm run typecheck
npm run build
```

## Deploy on Vercel

Import `pavnoorgrewal/routewise` into your own Vercel account as a new Next.js
project. Use `routewise-pavi7grewal` as the project name if available. Vercel will
assign a free `.vercel.app` address; the exact address is confirmed at deployment.
Use the `codex/pavi7grewal-deployment` source branch when deploying these build fixes.

No custom domain or DNS changes are required for a `.vercel.app` address. The
original `routewise.rehmatsg.com` deployment is independent of this copy.

## AI trip planning

The `/api/chat` endpoint uses Vercel AI Gateway with `openai/gpt-5.4-mini`.
The hosting account must have access to that model through AI Gateway. For local
development, set `AI_GATEWAY_API_KEY` in `.env.local` using your own gateway key.
Never commit API keys. Page rendering works without an AI key, but generated trip
plans require gateway authentication and available usage credit.

See [Vercel's gateway authentication documentation](https://vercel.com/docs/ai-gateway/authentication-and-byok)
for the API key and automatic Vercel OIDC options.

Pages: `/`, `/proposal`, and `/chat`.
