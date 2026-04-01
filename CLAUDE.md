# DEXLab Marketing Reporter — Claude Code Instructions

## Project overview
Scheduled marketing report bot:
1. **Monthly Report (Teams)** — LinkedIn + Instagram + Wix metrics, posted 1st of each month 09:00 CET via MS Graph
2. **Monthly Report (Email)** — Same metrics, sent via Resend API

Runs as GitHub Actions workflows. No hosting infrastructure.

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
- `src/monthly_report.py` — monthly Teams report entry point, orchestrates all data sources
- `src/send_report.py` — monthly email report entry point (via Resend)
- `src/teams_card.py` — Adaptive Card v1.4 builder for monthly report
- `src/post_to_teams.py` — Teams chat dispatcher via MS Graph
- `src/linkedin.py`, `src/instagram.py`, `src/wix.py` — data source modules

## Critical notes
- MS Graph auth uses public client ID `d3590ed6-52b3-4102-aeff-aad2292ab01c` (Office desktop) — no Azure AD app registration needed
- Meta tokens expire after 60 days — the bot warns in Teams when expiry is < 14 days
- Each data source module returns `{"success": bool, "error": str}` — card renders gracefully on partial failure
- Teams webhook failures exit with code 1 so GitHub Actions sends failure email

## Style
- Be concise. No trailing summaries.
- Lead with the action, skip unnecessary explanations.
- Don't ask before deploying — just do it.
