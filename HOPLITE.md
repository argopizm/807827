# Frenaw — project handoff

## Start here

Repository: https://github.com/argopizm/807827 (public). Production: https://frenaw.com.

Import this GitHub repository in the Hoplite web app. Use Node 22. Repository settings in `.hoplite/settings.json` install dependencies, create local-only environment files, migrate an empty local D1 database and start port 3000. If project UI settings override the file, use these same commands:

```sh
npm ci
node scripts/hoplite-setup.mjs
npm run dev -- --hostname 0.0.0.0 --port 3000
```

No production token is needed for development. No users are seeded; register disposable accounts in the local preview. Mail sending is intentionally unconfigured locally. Never use production personal data in a sandbox. Local preview metadata is noindex. Git history and this file provide project context; the old chat is not imported automatically.

Suggested first message: “Read AGENTS.md, HOPLITE.md and README.md. Continue the existing Frenaw application on a feature branch. Preserve current design, authorization and data privacy. Use local D1 for previews. Explain proposed changes before making unrelated changes. Run lint and Cloudflare build before opening a PR.”

## Stack and hosting

- Next.js 16.4.5 App Router, React 19, TypeScript, Auth.js 5 beta, CSS modules plus existing global CSS, Lucide icons. Read installed Next.js docs as AGENTS.md instructs.
- OpenNext Cloudflare adapter 1.20.16, Wrangler 4.157.0. Production is Worker `frenaw`; keep the existing custom domains and bindings in `wrangler.toml`.
- D1 binding `DB`, database `frelancer_db`. Versioned source of truth: `db/migrations/0001` through `0008` (already applied in production at handoff). `db/schema.sql` is legacy reference. Never reset production or replay schema.sql over it.
- `WORKER_SELF_REFERENCE` points to the same Worker. `workers/chat` is a separate optional WebSocket service, not enabled in current production. Current chat uses polling with visibility-aware updates.
- Existing Cloudflare runtime secrets: `AUTH_SECRET`, `RESEND_API_KEY`. Values stay in Cloudflare, never GitHub. Runtime public variables and bindings are in Wrangler configuration.
- Production build variables: `NEXT_PUBLIC_SITE_URL=https://frenaw.com`, `NEXT_PUBLIC_SITE_INDEXABLE=true`. Preview indexability must remain false.

## Publishing

The intended production pipeline is GitHub `main` → Cloudflare Workers Builds → `npm run build:cf` → `npx wrangler deploy`. Branch preview deployment must remain disabled with the current production bindings. Hoplite edits belong on a feature branch; review/merge to main publishes. A build failure leaves the last successful Worker serving traffic. Check Cloudflare's build result after merging.

`npm run build:cf` only builds; it does not deploy. Never replace this with the legacy Cloudflare Pages adapter. The old `807827.pages.dev` project is not the live custom-domain Worker. Do not migrate accounts, change D1 IDs, rotate secrets or alter DNS as part of routine UI changes.

New migrations require an intentional release step: validate on local/isolated D1, assess compatibility and backup/rollback, apply approved migrations with Wrangler, then deploy compatible application code. Automatic deploy does not apply remote migrations.

## Existing behavior to preserve

- Turkish red/cream visual identity, responsive mobile navigation, rich homepage/category/service/job/guide/support pages, reduced-motion support. Public category photos are decorative category images, not freelancers' portfolio work.
- Registration: private full name, public display name, email, password. Unique username is generated; public identity can be a brand or nickname. Email/full name are private. Registration is 18+.
- `/giris` full-screen auth with centered pill logo; shared header animates into/out of auth mode. `/profilim` shows own public profile; `/hesabim/profil` edits profile with preview, skills autocomplete and manual chips. Skills catalogue contains broad technology and category tags (20 selected maximum).
- `/hesabim/ayarlar`: password change, verified email change, self-service account deletion and session revocation. Resend provides outgoing verification mail. Support mailbox uses separate Cloudflare inbound routing; deployment must not change mail DNS.
- `/ilanlar`, `/isler/[id]`, `/hizmetler`: search/filter/detail/catalogue and owner controls. Proposal composer collects message, price and delivery days before submission. Price is integer kuruş in D1. Keep ownership checks, private proposal data and duplicate submission handling. Migration 0008 adds proposal terms; legacy proposals may contain null terms.
- `/mesajlar`: conversations, search, unread state, grouped dates, message read status, report/block, mobile list/detail panels. Authorize conversation membership on every server read/write. Do not fake other users' online status.
- `/destek`: tickets and replies, staff access based on support_staff. Staff permissions do not grant unrestricted private conversation access. Legal application route also exists.
- Homepage layout reservations and local fonts reduce CLS. Avoid changing image dimensions, auth header heights or inserting content above loaded sections. Prior synthetic CLS measurements were zero, not a guarantee of future field results.

## Incomplete / intentionally disabled

- NVİ verification is OFF. Never claim official verification or enable a fake/pass-through identity check. User's requirement: only live authorized verification, no retention/logging of TC/name/birth-year verification input. A retention-free implementation cannot itself guarantee one-person-one-account without additional design.
- Social sign-in: Google has conditional provider support but needs real authorized client configuration. GitHub, Discord and Microsoft sign-in are not completed; Apple deferred by owner. Do not render buttons as working without configured backend.
- Legal documents exist but are not certified legally complete: operator postal address, specific retention schedule and international transfer basis still need operator/legal review. Do not invent these or claim no third-party processing; Cloudflare and Resend process data.
- No advertising, marketing newsletter or analytics tracking planned. Account/chat/support history persists; only future identity verification input is subject to the zero-retention requirement.
- Rate limiting currently uses isolate-local memory. Durable/shared rate limits and stricter email-verification gating are future hardening items. Do not misrepresent the current controls.

## Validation

```sh
npm run lint
npm run build:cf
```

The Cloudflare build runs Next type checks. Validate changed authenticated flows against local D1 using disposable accounts. Do not add production test users or email real users. Never commit `.env*`, `.dev.vars*`, `.wrangler`, `.open-next`, database exports, private handoff documents or API keys.
