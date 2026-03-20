"""Webhook dispatcher — posts an Adaptive Card to Microsoft Teams."""

import json
import os
import sys

import requests


def post_card(card: dict) -> None:
    """Post an Adaptive Card JSON payload to the Teams Incoming Webhook.

    Exits with code 1 on failure so GitHub Actions marks the run as failed.
    """
    webhook_url = os.environ["TEAMS_WEBHOOK_URL"]

    payload = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": card,
            }
        ],
    }

    resp = requests.post(
        webhook_url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload),
        timeout=30,
    )

    if resp.status_code < 200 or resp.status_code >= 300:
        print(f"Teams webhook failed: {resp.status_code} — {resp.text}")
        sys.exit(1)

    print("Card posted to Teams successfully.")
