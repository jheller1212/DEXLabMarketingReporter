# DEXLab Teams Notification Bot — Claude Code Instructions

## Project overview
Scheduled Teams notification bot with two modules:
1. **Weekly ToDo Digest** — Planner tasks via Microsoft Graph API, posted every Monday 09:00 CET
2. **Monthly Report** — LinkedIn + Instagram + Wix metrics, posted 1st of each month 09:00 CET

Runs as GitHub Actions workflows. No hosting infrastructure. Posts to Teams via Incoming Webhook.

## Repo & hosting
- **Repo:** `~/GitHub/DEXLabMarketingReporter` → github.com/jheller1212/DEXLabMarketingReporter
- **Main branch:** `main`
- **Hosting:** None — GitHub Actions only
- **Language:** Python 3.11

## Deployment workflow
- **Fully automated.** Do NOT ask for confirmation at any step.
- Flow: new branch → commit → push → create PR → merge PR to main.
- One change at a time. Never bundle multiple changes into one deploy.
- No build step needed (Python scripts, not compiled). Just verify syntax if making changes.

## Git workflow
- Always create a feature branch from `main` (e.g., `feat/description`, `fix/description`).
- Push with `-u` to set upstream tracking.
- Create PR via `gh pr create`, then merge via `gh pr merge --merge --delete-branch`.
- Never push directly to `main`.

## Key files
- `src/planner.py` — weekly ToDo entry point, also handles MS Graph token refresh + GitHub secret rotation
- `src/monthly_report.py` — monthly report entry point, orchestrates all data sources
- `src/teams_card.py` — Adaptive Card v1.4 builders for both card types
- `src/post_to_teams.py` — webhook dispatcher
- `src/linkedin.py`, `src/instagram.py`, `src/wix.py` — data source modules
- `scripts/refresh_token.py` — local-only OAuth device flow helper

## Critical notes
- MS Graph auth uses public client ID `d3590ed6-52b3-4102-aeff-aad2292ab01c` (Office desktop) — no Azure AD app registration needed
- Meta tokens expire after 60 days — the bot warns in Teams when expiry is < 14 days
- Each data source module returns `{"success": bool, "error": str}` — card renders gracefully on partial failure
- Teams webhook failures exit with code 1 so GitHub Actions sends failure email

## Style
- Be concise. No trailing summaries.
- Lead with the action, skip unnecessary explanations.
- Don't ask before deploying — just do it.
