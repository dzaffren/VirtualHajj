# Check the repo's secrets with gh before a push whose CI needs them

**Learned:** 2026-10-21 · **From:** walking-skeleton /build

The user answered "secrets are set" twice, but the repo had none, so each CI run failed at the deploy step. A `gh secret set` that runs in another folder, or is cancelled at the prompt, leaves no sign.

Wrong: push on the user's word. Right: `gh api repos/dzaffren/VirtualHajj/actions/secrets -q '.secrets[].name'` lists `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then push.
