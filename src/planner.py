"""Microsoft Planner — fetch tasks and post weekly ToDo digest to Teams."""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone

import msal
import requests

from post_to_teams import post_card
from teams_card import build_todo_card

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
CLIENT_ID = "d3590ed6-52b3-4102-aeff-aad2292ab01c"
AUTHORITY = "https://login.microsoftonline.com/common"
SCOPES = ["Tasks.Read", "Chat.ReadWrite"]


def get_access_token() -> str:
    """Acquire a valid access token, refreshing if needed.

    After a successful refresh the new refresh token is persisted back to
    GitHub Secrets so the next run can use it.
    """
    refresh_token = os.environ["MS_GRAPH_REFRESH_TOKEN"]
    client_id = os.environ.get("MS_GRAPH_CLIENT_ID", CLIENT_ID)

    app = msal.PublicClientApplication(client_id, authority=AUTHORITY)
    result = app.acquire_token_by_refresh_token(refresh_token, scopes=SCOPES)

    if "access_token" not in result:
        print(f"Token refresh failed: {result.get('error_description', result)}")
        sys.exit(1)

    # Persist the rotated refresh token back to GitHub Secrets
    new_refresh = result.get("refresh_token", refresh_token)
    if new_refresh != refresh_token:
        _update_github_secret("MS_GRAPH_REFRESH_TOKEN", new_refresh)
        _update_github_secret("MS_GRAPH_TOKEN", result["access_token"])

    return result["access_token"]


def _update_github_secret(name: str, value: str) -> None:
    """Update a GitHub Actions secret using the gh CLI."""
    repo = os.environ.get("GITHUB_REPOSITORY")
    gh_token = os.environ.get("GH_TOKEN")
    if not repo or not gh_token:
        print(f"Skipping secret update for {name} — not running in CI or GH_TOKEN not set.")
        return
    try:
        subprocess.run(
            ["gh", "secret", "set", name, "--repo", repo, "--body", value],
            check=True,
            capture_output=True,
            env={**os.environ, "GH_TOKEN": gh_token},
        )
        print(f"Updated GitHub secret: {name}")
    except subprocess.CalledProcessError as exc:
        print(f"Warning: failed to update secret {name}: {exc.stderr.decode()}")


def fetch_tasks(token: str, plan_id: str) -> list[dict]:
    """Fetch all tasks from a Planner plan."""
    url = f"{GRAPH_BASE}/planner/plans/{plan_id}/tasks"
    headers = {"Authorization": f"Bearer {token}"}
    tasks = []

    while url:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        tasks.extend(data.get("value", []))
        url = data.get("@odata.nextLink")

    return tasks


def resolve_user(token: str, user_id: str, cache: dict) -> str:
    """Resolve a user ID to a display name, with caching."""
    if user_id in cache:
        return cache[user_id]
    try:
        resp = requests.get(
            f"{GRAPH_BASE}/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        resp.raise_for_status()
        name = resp.json().get("displayName", user_id)
    except Exception:
        name = user_id
    cache[user_id] = name
    return name


def categorize_tasks(tasks: list[dict], token: str) -> tuple[list, list, list]:
    """Split tasks into overdue, due this week, and unassigned buckets."""
    now = datetime.now(timezone.utc)
    today = now.date()
    week_end = today + timedelta(days=7)
    user_cache: dict[str, str] = {}

    overdue, due_this_week, unassigned = [], [], []

    for t in tasks:
        if t.get("percentComplete", 0) >= 100:
            continue

        # Parse assignees
        assignments = t.get("assignments") or {}
        assignee_ids = list(assignments.keys())
        assignee_names = [resolve_user(token, uid, user_cache) for uid in assignee_ids]
        assignee_str = ", ".join(assignee_names) if assignee_names else None

        # Parse due date
        due_raw = t.get("dueDateTime")
        due_date = None
        due_str = None
        if due_raw:
            due_date = datetime.fromisoformat(due_raw.replace("Z", "+00:00")).date()
            due_str = due_date.strftime("%b %d")

        entry = {
            "title": t.get("title", "(untitled)"),
            "assignee": assignee_str,
            "due": due_str,
        }

        if not assignee_ids:
            unassigned.append(entry)
        elif due_date and due_date < today:
            overdue.append(entry)
        elif due_date and today <= due_date <= week_end:
            due_this_week.append(entry)
        elif due_date is None:
            # No due date but assigned — skip (not in any bucket per spec)
            pass

    return overdue, due_this_week, unassigned


def main() -> None:
    token = get_access_token()
    plan_id = os.environ["PLANNER_PLAN_ID"]

    print("Fetching Planner tasks…")
    tasks = fetch_tasks(token, plan_id)
    print(f"Fetched {len(tasks)} tasks.")

    overdue, due_this_week, unassigned = categorize_tasks(tasks, token)
    print(f"Overdue: {len(overdue)}, Due this week: {len(due_this_week)}, Unassigned: {len(unassigned)}")

    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")
    card = build_todo_card(overdue, due_this_week, unassigned, date_str)
    post_card(card, token=token)


if __name__ == "__main__":
    main()
