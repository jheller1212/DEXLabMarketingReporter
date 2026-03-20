# DEXLab Teams Notification Bot

Scheduled notification bot that posts automated digests to a Microsoft Teams channel via Incoming Webhook. Two modules:

1. **Weekly ToDo Digest** — pulls incomplete tasks from Microsoft Planner and posts a categorized overview (overdue / due this week / unassigned) every Monday at 09:00 CET.
2. **Monthly Report** — aggregates LinkedIn, Instagram, and Wix website metrics and posts a performance summary on the 1st of each month at 09:00 CET.

Runs entirely as GitHub Actions workflows — zero hosting cost.

---

## Repository Structure

```
├── .github/workflows/
│   ├── weekly_todos.yml          # Monday 09:00 CET
│   └── monthly_report.yml        # 1st of month 09:00 CET
├── src/
│   ├── planner.py                # Microsoft Graph API – Planner tasks
│   ├── linkedin.py               # LinkedIn Organization API
│   ├── instagram.py              # Meta Graph API – Instagram Business
│   ├── wix.py                    # Wix RSS feed + Analytics
│   ├── teams_card.py             # Adaptive Card formatter
│   ├── post_to_teams.py          # Webhook dispatcher
│   └── monthly_report.py         # Monthly report orchestrator
├── scripts/
│   └── refresh_token.py          # One-time OAuth token helper (local use only)
├── requirements.txt
└── .env.example
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/jheller1212/DEXLabMarketingReporter.git
cd DEXLabMarketingReporter
pip install -r requirements.txt
```

### 2. Microsoft Graph token (for Planner)

```bash
python scripts/refresh_token.py
```

Follow the device flow prompt, then paste the tokens into GitHub Secrets.

### 3. GitHub Secrets

| Secret | Description |
|---|---|
| `TEAMS_WEBHOOK_URL` | Teams Incoming Webhook URL |
| `MS_GRAPH_TOKEN` | Microsoft Graph access token |
| `MS_GRAPH_REFRESH_TOKEN` | Microsoft Graph refresh token |
| `PLANNER_PLAN_ID` | Planner plan ID |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn OAuth token |
| `LINKEDIN_ORG_URN` | LinkedIn org URN (`urn:li:organization:ID`) |
| `META_PAGE_ACCESS_TOKEN` | Meta long-lived page access token |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram Business Account ID |
| `WIX_API_KEY` | Wix API key |
| `WIX_SITE_ID` | Wix site ID |
| `GH_PAT` | GitHub PAT with `repo` scope (for secret rotation) |

### 4. Local testing

```bash
# Copy and fill in .env.example, then:
export $(cat .env | xargs)
python src/planner.py
python src/monthly_report.py
```

---

## Built By

[Jonas Heller](https://www.linkedin.com/in/hellerjonas/) — Assistant Professor of Marketing, Maastricht University.

## License

MIT
