# Check the CI secrets and the Pages project before a push that deploys

**Learned:** 2026-10-21 · **From:** walking-skeleton /build

The user answered "secrets are set" twice, but the repo had none. Then the Pages project was missing. Each CI run failed at the deploy step. A `gh secret set` that runs in another folder, or is cancelled at the prompt, leaves no sign.

Wrong: push on the user's word. Right: `gh api repos/dzaffren/VirtualHajj/actions/secrets -q '.secrets[].name'` lists `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and `pnpm exec wrangler pages project list` shows `virtualhajj`. Then push.
