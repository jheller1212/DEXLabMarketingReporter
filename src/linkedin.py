"""LinkedIn Organization API — fetch monthly social media metrics."""

import os
from datetime import datetime, timedelta, timezone

import requests

REST_BASE = "https://api.linkedin.com/rest"


def fetch_linkedin_data() -> dict:
    """Fetch LinkedIn org metrics for the prior month.

    Returns {"success": True, "data": {...}} or {"success": False, "error": "..."}.
    """
    try:
        token = os.environ["LINKEDIN_ACCESS_TOKEN"]
        org_urn = os.environ["LINKEDIN_ORG_URN"]
    except KeyError as exc:
        return {"success": False, "error": f"Missing env var: {exc}"}

    headers = {
        "Authorization": f"Bearer {token}",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    try:
        # Date range: prior calendar month
        today = datetime.now(timezone.utc).date()
        first_of_this_month = today.replace(day=1)
        last_of_prev_month = first_of_this_month - timedelta(days=1)
        first_of_prev_month = last_of_prev_month.replace(day=1)

        start_ms = int(datetime.combine(first_of_prev_month, datetime.min.time(), tzinfo=timezone.utc).timestamp() * 1000)
        end_ms = int(datetime.combine(last_of_prev_month, datetime.max.time(), tzinfo=timezone.utc).timestamp() * 1000)

        # Follower stats
        follower_resp = requests.get(
            f"{REST_BASE}/organizationalEntityFollowerStatistics",
            headers=headers,
            params={"q": "organizationalEntity", "organizationalEntity": org_urn},
            timeout=30,
        )
        follower_resp.raise_for_status()
        follower_data = follower_resp.json()
        followers = 0
        if "elements" in follower_data and follower_data["elements"]:
            el = follower_data["elements"][0]
            followers = el.get("followerCounts", {}).get("organicFollowerCount", 0) + el.get("followerCounts", {}).get("paidFollowerCount", 0)

        # Share statistics
        share_resp = requests.get(
            f"{REST_BASE}/organizationalEntityShareStatistics",
            headers=headers,
            params={
                "q": "organizationalEntity",
                "organizationalEntity": org_urn,
                "timeIntervals.timeGranularityType": "MONTH",
                "timeIntervals.timeRange.start": start_ms,
                "timeIntervals.timeRange.end": end_ms,
            },
            timeout=30,
        )
        share_resp.raise_for_status()
        share_data = share_resp.json()

        impressions = 0
        engagements = 0
        if "elements" in share_data and share_data["elements"]:
            for el in share_data["elements"]:
                stats = el.get("totalShareStatistics", {})
                impressions += stats.get("impressionCount", 0)
                engagements += stats.get("likeCount", 0) + stats.get("commentCount", 0) + stats.get("shareCount", 0)

        engagement_rate = (engagements / impressions * 100) if impressions > 0 else 0.0

        # Posts — find top by engagement
        posts_resp = requests.get(
            f"{REST_BASE}/posts",
            headers=headers,
            params={"author": org_urn, "q": "author", "count": 50},
            timeout=30,
        )
        posts_resp.raise_for_status()
        posts_data = posts_resp.json()

        top_post_title = None
        top_engagement = -1
        for post in posts_data.get("elements", []):
            created = post.get("createdAt", 0)
            if start_ms <= created <= end_ms:
                eng = post.get("likeCount", 0) + post.get("commentCount", 0)
                if eng > top_engagement:
                    top_engagement = eng
                    top_post_title = post.get("commentary", post.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {}).get("shareCommentary", {}).get("text", ""))
                    if not top_post_title:
                        top_post_title = "(no caption)"

        return {
            "success": True,
            "data": {
                "followers": followers,
                "follower_delta": None,  # LinkedIn doesn't provide historical follower counts easily
                "impressions": impressions,
                "engagements": engagements,
                "engagement_rate": engagement_rate,
                "top_post_title": top_post_title or "—",
            },
        }

    except Exception as exc:
        print(f"LinkedIn error: {exc}")
        return {"success": False, "error": str(exc)}
