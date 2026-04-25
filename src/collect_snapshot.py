"""Collect a LinkedIn data snapshot and save to data/snapshots/."""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

V2_BASE = "https://api.linkedin.com/v2"


def collect() -> dict:
    token = os.environ["LINKEDIN_ACCESS_TOKEN"]
    org_urn = os.environ["LINKEDIN_ORG_URN"]
    org_id = org_urn.split(":")[-1]
    headers = {"Authorization": f"Bearer {token}"}
    today = datetime.now(timezone.utc).date().isoformat()

    snapshot = {"date": today, "org_urn": org_urn, "linkedin": {}}

    # 1. Follower stats
    try:
        r = requests.get(
            f"{V2_BASE}/organizationalEntityFollowerStatistics",
            headers=headers,
            params={"q": "organizationalEntity", "organizationalEntity": org_urn},
            timeout=30,
        )
        r.raise_for_status()
        el = r.json().get("elements", [{}])[0]

        total_followers = 0
        by_function = {}
        for fc in el.get("followerCountsByFunction", []):
            count = fc["followerCounts"]["organicFollowerCount"] + fc["followerCounts"].get("paidFollowerCount", 0)
            total_followers += count
            by_function[fc["function"]] = count

        by_seniority = {}
        for sc in el.get("followerCountsBySeniority", []):
            count = sc["followerCounts"]["organicFollowerCount"] + sc["followerCounts"].get("paidFollowerCount", 0)
            by_seniority[sc["seniority"]] = count

        by_industry = {}
        for ic in el.get("followerCountsByIndustry", []):
            count = ic["followerCounts"]["organicFollowerCount"] + ic["followerCounts"].get("paidFollowerCount", 0)
            by_industry[ic["industry"]] = count

        snapshot["linkedin"]["followers"] = {
            "total": total_followers,
            "by_function": by_function,
            "by_seniority": by_seniority,
            "by_industry": by_industry,
        }
        print(f"  Followers: {total_followers:,}")
    except Exception as e:
        print(f"  Follower stats failed: {e}")
        snapshot["linkedin"]["followers"] = {"error": str(e)}

    # 2. Share/engagement stats
    try:
        r = requests.get(
            f"{V2_BASE}/organizationalEntityShareStatistics",
            headers=headers,
            params={"q": "organizationalEntity", "organizationalEntity": org_urn},
            timeout=30,
        )
        r.raise_for_status()
        elements = r.json().get("elements", [])
        stats = elements[0].get("totalShareStatistics", {}) if elements else {}
        snapshot["linkedin"]["engagement"] = {
            "impressions": stats.get("impressionCount", 0),
            "unique_impressions": stats.get("uniqueImpressionsCount", 0),
            "likes": stats.get("likeCount", 0),
            "comments": stats.get("commentCount", 0),
            "shares": stats.get("shareCount", 0),
            "clicks": stats.get("clickCount", 0),
            "engagement_rate": round(stats.get("engagement", 0) * 100, 2),
        }
        print(f"  Impressions: {stats.get('impressionCount', 0):,}")
        print(f"  Engagement: {stats.get('engagement', 0) * 100:.1f}%")
    except Exception as e:
        print(f"  Share stats failed: {e}")
        snapshot["linkedin"]["engagement"] = {"error": str(e)}

    # 3. Page views
    try:
        r = requests.get(
            f"{V2_BASE}/organizationPageStatistics",
            headers=headers,
            params={"q": "organization", "organization": org_urn},
            timeout=30,
        )
        r.raise_for_status()
        elements = r.json().get("elements", [])
        views = elements[0].get("totalPageStatistics", {}).get("views", {}) if elements else {}
        snapshot["linkedin"]["page_views"] = {
            "total": views.get("allPageViews", {}).get("pageViews", 0),
            "desktop": views.get("allDesktopPageViews", {}).get("pageViews", 0),
            "mobile": views.get("allMobilePageViews", {}).get("pageViews", 0),
            "overview": views.get("overviewPageViews", {}).get("pageViews", 0),
            "about": views.get("aboutPageViews", {}).get("pageViews", 0),
            "careers": views.get("careersPageViews", {}).get("pageViews", 0),
            "jobs": views.get("jobsPageViews", {}).get("pageViews", 0),
            "people": views.get("peoplePageViews", {}).get("pageViews", 0),
        }
        print(f"  Page views: {views.get('allPageViews', {}).get('pageViews', 0):,}")
    except Exception as e:
        print(f"  Page stats failed: {e}")
        snapshot["linkedin"]["page_views"] = {"error": str(e)}

    return snapshot


def main():
    print("Collecting LinkedIn snapshot...")
    snapshot = collect()

    # Save to data/snapshots/
    data_dir = Path(__file__).resolve().parent.parent / "data" / "snapshots"
    data_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{snapshot['date']}.json"
    filepath = data_dir / filename
    with open(filepath, "w") as f:
        json.dump(snapshot, f, indent=2)
    print(f"\nSnapshot saved to data/snapshots/{filename}")

    # Also update data/latest.json for the dashboard
    latest_path = data_dir.parent / "latest.json"
    with open(latest_path, "w") as f:
        json.dump(snapshot, f, indent=2)
    print(f"Latest snapshot updated at data/latest.json")

    # Build an index of all snapshots for the dashboard
    snapshots = sorted([f.stem for f in data_dir.glob("*.json")])
    index_path = data_dir.parent / "index.json"
    with open(index_path, "w") as f:
        json.dump({"snapshots": snapshots}, f, indent=2)
    print(f"Index updated with {len(snapshots)} snapshot(s)")


if __name__ == "__main__":
    main()
