# Deploying REPL-ay to Vercel

This repository contains the Next.js app in the `repl-ay-app/` subdirectory. Vercel supports subdirectory projects. You can import the repo root into Vercel and set the project Root Directory to `repl-ay-app`.

## Vercel Project Settings

- Framework Preset: Next.js
- Root Directory: `repl-ay-app` (important)
- Build Command: (auto) `next build`
- Install Command: (auto) `npm install`
- Output Directory: (auto)
- Node.js Version: 20
- Serverless Functions Runtime: Node.js 20

There is a `vercel.json` inside `repl-ay-app/` that configures the runtime and limits for App Router API routes (`app/api/**/route.*`).

## Environment Variables

Set in Vercel under Project Settings → Environment Variables:

- OPENAI_API_KEY (optional)
- ANTHROPIC_API_KEY (optional)
- GOOGLE_API_KEY (optional)
- GROQ_API_KEY (optional)
- MISTRAL_API_KEY (optional)
- QWEN_API_KEY (optional)
- XAI_API_KEY (optional)
- OLLAMA_BASE_URL (optional - local dev only; leave unset in Vercel)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (for production)
- NEXT_PUBLIC_APP_URL (your Vercel domain URL)

Only set the providers you intend to use; the app detects availability automatically.

## Stripe Webhooks

Create a Vercel environment variable `STRIPE_WEBHOOK_SECRET` for production. In development, use the local `.env.local`.

## Deployment Steps

1. Push your changes to GitHub.
2. Create a new Vercel Project from this repo.
3. In Project Settings:
   - Root Directory: `repl-ay-app`
   - Environment Variables: add as needed (above)
   - Node.js Version: 20
4. Deploy. Vercel will build from `repl-ay-app` and expose your routes.

## Notes

- The app uses the Next.js App Router with API routes in `app/api/*`.
- Long-running model requests should complete within the default function timeout; `vercel.json` sets `maxDuration` to 20s and memory to 1024 MB for `app/api/**/route.*`.
- Telemetry: you can disable Next telemetry by adding `NEXT_TELEMETRY_DISABLED=1` in the Vercel environment.
