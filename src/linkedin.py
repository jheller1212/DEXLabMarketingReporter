"""LinkedIn Organization API — fetch social media metrics via v2 API."""

import os
from datetime import datetime, timedelta, timezone

import requests

V2_BASE = "https://api.linkedin.com/v2"


def fetch_linkedin_data() -> dict:
    """Fetch LinkedIn org metrics.

    Returns {"success": True, "data": {...}} or {"success": False, "error": "..."}.
    """
    try:
        token = os.environ["LINKEDIN_ACCESS_TOKEN"]
        org_urn = os.environ["LINKEDIN_ORG_URN"]
    except KeyError as exc:
        return {"success": False, "error": f"Missing env var: {exc}"}

    # Extract numeric org ID from URN
    org_id = org_urn.split(":")[-1]
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Follower stats — sum organic followers across all functions
        follower_resp = requests.get(
            f"{V2_BASE}/organizationalEntityFollowerStatistics",
            headers=headers,
            params={"q": "organizationalEntity", "organizationalEntity": org_urn},
            timeout=30,
        )
        follower_resp.raise_for_status()
        follower_data = follower_resp.json()

        followers = 0
        if "elements" in follower_data and follower_data["elements"]:
            el = follower_data["elements"][0]
            # Sum across function breakdown for total count
            for fc in el.get("followerCountsByFunction", []):
                followers += fc.get("followerCounts", {}).get("organicFollowerCount", 0)
                followers += fc.get("followerCounts", {}).get("paidFollowerCount", 0)

        # Share statistics (all-time for the org)
        share_resp = requests.get(
            f"{V2_BASE}/organizationalEntityShareStatistics",
            headers=headers,
            params={
                "q": "organizationalEntity",
                "organizationalEntity": org_urn,
            },
            timeout=30,
        )
        share_resp.raise_for_status()
        share_data = share_resp.json()

        impressions = 0
        unique_impressions = 0
        likes = 0
        comments = 0
        shares = 0
        clicks = 0
        engagement_rate = 0.0

        if "elements" in share_data and share_data["elements"]:
            for el in share_data["elements"]:
                stats = el.get("totalShareStatistics", {})
                impressions += stats.get("impressionCount", 0)
                unique_impressions += stats.get("uniqueImpressionsCount", 0)
                likes += stats.get("likeCount", 0)
                comments += stats.get("commentCount", 0)
                shares += stats.get("shareCount", 0)
                clicks += stats.get("clickCount", 0)
                engagement_rate = stats.get("engagement", 0.0) * 100

        return {
            "success": True,
            "data": {
                "followers": followers,
                "impressions": impressions,
                "unique_impressions": unique_impressions,
                "likes": likes,
                "comments": comments,
                "shares": shares,
                "clicks": clicks,
                "engagement_rate": engagement_rate,
            },
        }

    except Exception as exc:
        print(f"LinkedIn error: {exc}")
        return {"success": False, "error": str(exc)}
