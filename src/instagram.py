"""Meta Graph API — Instagram Business account metrics."""

import os
from datetime import datetime, timedelta, timezone

import requests

GRAPH_BASE = "https://graph.facebook.com/v18.0"


def _check_token_expiry(token: str) -> str | None:
    """Check if the Meta token expires within 14 days. Returns a warning string or None."""
    try:
        resp = requests.get(
            f"{GRAPH_BASE}/debug_token",
            params={"input_token": token, "access_token": token},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json().get("data", {})
        expires_at = data.get("expires_at", 0)
        if expires_at == 0:
            return None  # Never expires
        expiry = datetime.fromtimestamp(expires_at, tz=timezone.utc)
        days_left = (expiry - datetime.now(timezone.utc)).days
        if days_left < 14:
            return f"Meta token expires in {days_left} day{'s' if days_left != 1 else ''} (on {expiry.strftime('%Y-%m-%d')}). Refresh it in the Meta Developer Console."
    except Exception:
        pass
    return None


def fetch_instagram_data() -> tuple[dict, str | None]:
    """Fetch Instagram metrics for the prior month.

    Returns (result_dict, token_warning_or_None).
    result_dict is {"success": True, "data": {...}} or {"success": False, "error": "..."}.
    """
    try:
        token = os.environ["META_PAGE_ACCESS_TOKEN"]
        ig_id = os.environ["INSTAGRAM_BUSINESS_ACCOUNT_ID"]
    except KeyError as exc:
        return {"success": False, "error": f"Missing env var: {exc}"}, None

    token_warning = _check_token_expiry(token)

    try:
        # Account info — follower count
        account_resp = requests.get(
            f"{GRAPH_BASE}/{ig_id}",
            params={"fields": "followers_count", "access_token": token},
            timeout=15,
        )
        account_resp.raise_for_status()
        followers = account_resp.json().get("followers_count", 0)

        # Insights — reach, impressions for the prior 30-day period
        insights_resp = requests.get(
            f"{GRAPH_BASE}/{ig_id}/insights",
            params={
                "metric": "reach,impressions",
                "period": "days_28",
                "access_token": token,
            },
            timeout=15,
        )
        insights_resp.raise_for_status()
        insights_data = insights_resp.json().get("data", [])

        reach = 0
        impressions = 0
        for metric in insights_data:
            name = metric.get("name")
            values = metric.get("values", [])
            val = values[-1]["value"] if values else 0
            if name == "reach":
                reach = val
            elif name == "impressions":
                impressions = val

        # Recent media — engagement
        today = datetime.now(timezone.utc).date()
        first_of_this_month = today.replace(day=1)
        last_of_prev_month = first_of_this_month - timedelta(days=1)
        first_of_prev_month = last_of_prev_month.replace(day=1)

        media_resp = requests.get(
            f"{GRAPH_BASE}/{ig_id}/media",
            params={
                "fields": "id,caption,like_count,comments_count,timestamp",
                "limit": 100,
                "access_token": token,
            },
            timeout=15,
        )
        media_resp.raise_for_status()
        media = media_resp.json().get("data", [])

        total_engagement = 0
        post_count = 0
        top_caption = None
        top_engagement = -1

        for m in media:
            ts = datetime.fromisoformat(m["timestamp"].replace("Z", "+00:00")).date()
            if first_of_prev_month <= ts <= last_of_prev_month:
                likes = m.get("like_count", 0)
                comments = m.get("comments_count", 0)
                eng = likes + comments
                total_engagement += eng
                post_count += 1
                if eng > top_engagement:
                    top_engagement = eng
                    top_caption = m.get("caption", "(no caption)")

        avg_engagement_rate = 0.0
        if post_count > 0 and followers > 0:
            avg_engagement_rate = (total_engagement / post_count) / followers * 100

        return {
            "success": True,
            "data": {
                "followers": followers,
                "follower_delta": None,  # Would need stored prior month value
                "reach": reach,
                "impressions": impressions,
                "avg_engagement_rate": avg_engagement_rate,
                "top_post_caption": top_caption or "—",
            },
        }, token_warning

    except Exception as exc:
        print(f"Instagram error: {exc}")
        return {"success": False, "error": str(exc)}, token_warning
