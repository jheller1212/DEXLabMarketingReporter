# DEXLab Marketing Reporter

Automated marketing analytics for the [DEXLab](https://www.sbe-dexlab.com) at Maastricht University. Pulls metrics from LinkedIn, Instagram, and the Wix website, then delivers reports via Teams and email — all on autopilot through GitHub Actions.

## What it does

### Monthly Teams Report
On the 1st of each month at 09:00 CET, a GitHub Actions workflow collects the previous month's metrics from LinkedIn (followers, impressions, engagement), Instagram (reach, followers, top posts), and the Wix website (visits, page views). It formats everything into an Adaptive Card and posts it to the DEXLab Teams group chat via Microsoft Graph API.

### Monthly Email Report
Same data, different format — a clean HTML email sent via Resend to the team.

### Weekly Email Report
Every Monday, a LinkedIn-focused email digest goes out with the past week's performance highlights.

### Weekly ToDo Digest
Pulls incomplete tasks from Microsoft Planner and posts a categorized overview (overdue / due this week / unassigned) to Teams every Monday at 09:00 CET.

### Data Snapshots
Each report run also saves a JSON snapshot to `data/snapshots/`, building a historical record of metrics over time.

### Dashboard (WIP)
A React + Vite dashboard for visualizing historical trends. Hosted on Netlify.

## How it runs

Everything runs as GitHub Actions workflows — zero hosting cost, no webhook connectors, no Power Automate. Push to `main` and the schedules take over.

## Repository structure

```
.github/workflows/
  weekly_todos.yml          # Monday 09:00 CET — Planner digest
  monthly_report.yml        # 1st of month 09:00 CET — full report

src/
  linkedin.py               # LinkedIn Organization API
  instagram.py              # Meta Graph API — Instagram Business
  wix.py                    # Wix RSS feed + Analytics
  planner.py                # Microsoft Graph API — Planner tasks
  teams_card.py             # Adaptive Card builder
  post_to_teams.py          # Graph API chat message dispatcher
  monthly_report.py         # Monthly Teams report orchestrator
  send_report.py            # Monthly email report (Resend)
  weekly_email_report.py    # Weekly email report (Resend)
  collect_snapshot.py       # Saves metrics snapshot to data/

dashboard/                  # React + Vite trend dashboard
data/                       # Historical metric snapshots
scripts/
  refresh_token.py          # One-time OAuth token helper (local use only)
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/jheller1212/DEXLabMarketingReporter.git
cd DEXLabMarketingReporter
pip install -r requirements.txt
```

### 2. Microsoft Graph token

```bash
python scripts/refresh_token.py
```

Follow the device flow prompt, then paste the tokens into GitHub Secrets.

### 3. GitHub Secrets

| Secret | Description |
|---|---|
| `TEAMS_CHAT_ID` | Teams group chat ID |
| `MS_GRAPH_TOKEN` | Microsoft Graph access token |
| `MS_GRAPH_REFRESH_TOKEN` | Microsoft Graph refresh token |
| `PLANNER_PLAN_ID` | Planner plan ID |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn OAuth token |
| `LINKEDIN_ORG_URN` | LinkedIn org URN (`urn:li:organization:ID`) |
| `META_PAGE_ACCESS_TOKEN` | Meta long-lived page access token |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram Business Account ID |
| `WIX_API_KEY` | Wix API key |
| `WIX_SITE_ID` | Wix site ID |
| `RESEND_API_KEY` | Resend API key (for email reports) |
| `GH_PAT` | GitHub PAT with `repo` scope (for secret rotation) |

### 4. Local testing

```bash
cp .env.example .env
# Fill in your values, then:
export $(cat .env | xargs)
python src/monthly_report.py
python src/send_report.py
```

## Built by

[Jonas Heller](https://jonasheller.info) — Assistant Professor of Marketing, Maastricht University.

## License

MIT
