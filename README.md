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
`OPENAI_API_KEY`, then restart the development server. A Vercel AI Gateway key
(`AI_GATEWAY_API_KEY`) is also supported as an alternative. Without either
provider configured, the pages load but trip generation is unavailable.

The model is accessed over the internet; it does not run offline on your computer.

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

The `/api/chat` endpoint uses OpenAI's `gpt-5.4-mini` through your direct
`OPENAI_API_KEY` when it is set. Otherwise it uses `openai/gpt-5.4-mini` through
Vercel AI Gateway. In Vercel, add your chosen key under the project's Environment
Variables and redeploy. API billing is separate from a ChatGPT subscription.
Never commit API keys. Page rendering works without an AI key, but generated trip
plans require provider authentication and available usage credit.

For direct OpenAI access, create a key in the [OpenAI API dashboard](https://platform.openai.com/api-keys).
For the gateway alternative, see [Vercel's authentication documentation](https://vercel.com/docs/ai-gateway/authentication-and-byok).

## Route maps

Every generated itinerary includes a Google Maps directions link with its stops.
For an interactive map inside the itinerary, enable the Google Maps Embed API in
Google Cloud and set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` locally and in Vercel.
Google requires a Maps API key and billing account for embeds. Restrict this
browser-visible key to your site's HTTP referrers and the Maps Embed API. Routes
and travel times shown in the AI itinerary are estimates until checked against
the map; live charging-station availability is not connected.
See [Google's Maps Embed API setup](https://developers.google.com/maps/documentation/embed/get-api-key)
for key and billing setup. The external Google Maps link works without it.

Pages: `/`, `/proposal`, and `/chat`.
