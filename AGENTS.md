<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Frenaw project

Read `HOPLITE.md` and `README.md` before changes. Keep the existing Turkish red/cream design and mobile layouts. Public identity uses display names; full names, email and private messages must never leak into public APIs.

Use local D1 for development (`node scripts/hoplite-setup.mjs`). Never copy production data or credentials into source, prompts, fixtures or logs. Do not enable NVİ or social providers without their real authorized integrations. Production is the existing Cloudflare Worker `frenaw`, not legacy Pages. Review new database migrations separately before applying them remotely. Main is the production branch; work on feature branches and review before merging.
