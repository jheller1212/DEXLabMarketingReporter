"""Posts an Adaptive Card to a Microsoft Teams group chat via Graph API.

Set DRY_RUN=1 to print the card JSON to stdout instead of posting.
"""

import json
import os
import sys

import requests


GRAPH_BASE = "https://graph.microsoft.com/v1.0"


def post_card(card: dict, token: str | None = None) -> None:
    """Post an Adaptive Card to a Teams group chat via Microsoft Graph API.

    If DRY_RUN env var is set, prints the card JSON to stdout and skips posting.
    """
    if os.environ.get("DRY_RUN"):
        print("\n" + "=" * 60)
        print("DRY RUN — Card that would be posted to Teams:")
        print("=" * 60)
        print(json.dumps(card, indent=2))
        print("=" * 60 + "\n")
        return

    if token is None:
        token = os.environ["MS_GRAPH_TOKEN"]

    chat_id = os.environ["TEAMS_CHAT_ID"]

    payload = {
        "body": {
            "contentType": "html",
            "content": '<attachment id="card"></attachment>',
        },
        "attachments": [
            {
                "id": "card",
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": json.dumps(card),
            }
        ],
    }

    resp = requests.post(
        f"{GRAPH_BASE}/chats/{chat_id}/messages",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload),
        timeout=30,
    )

    if resp.status_code < 200 or resp.status_code >= 300:
        print(f"Teams post failed: {resp.status_code} — {resp.text}")
        sys.exit(1)

    print("Card posted to Teams group chat successfully.")
