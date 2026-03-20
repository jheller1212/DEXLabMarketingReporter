# DEXLab Marketing Reporter — Claude Code Instructions

## Project overview
Marketing analytics and reporting tool for DEXLab.

## Repo & hosting
- **Repo:** `~/GitHub/DEXLabMarketingReporter` → github.com/jheller1212/DEXLabMarketingReporter
- **Main branch:** `main`
- **Hosting:** TBD (Netlify if needed)
- **Supabase:** TBD (add if needed)

## Deployment workflow
- **Fully automated.** Do NOT ask for confirmation at any step.
- Flow: build check → new branch → commit → push → create PR → merge PR to main.
- One change at a time. Never bundle multiple changes into one deploy.
- Always run `npm run build` (or equivalent) before pushing to catch errors early.

## Git workflow
- Always create a feature branch from `main` (e.g., `feat/description`, `fix/description`).
- Push with `-u` to set upstream tracking.
- Create PR via `gh pr create`, then merge via `gh pr merge --merge --delete-branch`.
- Never push directly to `main`.

## Build & dev commands
```bash
npm install        # Install dependencies
npm run dev        # Local dev server
npm run build      # Production build
npm test           # Run tests (if configured)
```

## Style
- Be concise. No trailing summaries.
- Lead with the action, skip unnecessary explanations.
- Don't ask before deploying — just do it.
