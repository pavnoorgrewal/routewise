# Routewise

The original Routewise application, prepared for a separate deployment with
`pavi7grewal` in its web address. The Routewise name, page content, styles, images,
and animations are preserved.

## Run locally

Use Node.js 20.9 or newer and the pinned pnpm version:

```sh
npx pnpm@10.11.0 install --frozen-lockfile
npm run dev
```

Open http://localhost:3000.

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

Pages: `/`, `/proposal`, `/user-research`, `/concept-design-report`, and `/chat`.
