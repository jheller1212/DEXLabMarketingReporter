"""Wix — RSS blog feed and website analytics."""

import os
from datetime import datetime, timedelta, timezone

import feedparser
import requests


def fetch_blog_posts() -> dict:
    """Fetch blog posts published in the current calendar month from the Wix RSS feed.

    Returns {"success": True, "data": [{"title": ..., "date": ..., "url": ...}, ...]}
    or {"success": False, "error": "..."}.
    """
    feed_url = "https://www.sbe-dexlab.com/blog-feed.xml"
    try:
        feed = feedparser.parse(feed_url)
        if feed.bozo and not feed.entries:
            return {"success": False, "error": f"Feed parse error: {feed.bozo_exception}"}

        today = datetime.now(timezone.utc).date()
        first_of_month = today.replace(day=1)

        posts = []
        for entry in feed.entries:
            published = entry.get("published_parsed") or entry.get("updated_parsed")
            if not published:
                continue
            pub_date = datetime(*published[:6], tzinfo=timezone.utc).date()
            if pub_date >= first_of_month:
                posts.append({
                    "title": entry.get("title", "(untitled)"),
                    "date": pub_date.strftime("%b %d"),
                    "url": entry.get("link", ""),
                })

        return {"success": True, "data": posts}

    except Exception as exc:
        print(f"Wix RSS error: {exc}")
        return {"success": False, "error": str(exc)}


def fetch_wix_analytics() -> dict:
    """Fetch website analytics for the prior calendar month from the Wix Analytics API.

    Returns {"success": True, "data": {...}} or {"success": False, "error": "..."}.
    """
    try:
        api_key = os.environ["WIX_API_KEY"]
        site_id = os.environ["WIX_SITE_ID"]
    except KeyError as exc:
        return {"success": False, "error": f"Missing env var: {exc}"}

    try:
        today = datetime.now(timezone.utc).date()
        first_of_this_month = today.replace(day=1)
        last_of_prev_month = first_of_this_month - timedelta(days=1)
        first_of_prev_month = last_of_prev_month.replace(day=1)

        headers = {
            "Authorization": api_key,
            "wix-site-id": site_id,
            "Content-Type": "application/json",
        }

        resp = requests.post(
            "https://www.wixapis.com/analytics/v2/data-totals",
            headers=headers,
            json={
                "dateRange": {
                    "startDate": first_of_prev_month.isoformat(),
                    "endDate": last_of_prev_month.isoformat(),
                },
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        totals = data.get("dataTotals", data.get("data", {}))
        sessions = totals.get("sessions", 0)
        unique_visitors = totals.get("uniqueVisitors", totals.get("visitors", 0))
        page_views = totals.get("pageViews", 0)
        top_page = "—"

        # Try to get top pages if available
        top_pages = totals.get("topPages", [])
        if top_pages:
            top_page = top_pages[0].get("path", top_pages[0].get("url", "—"))

        return {
            "success": True,
            "data": {
                "sessions": sessions,
                "unique_visitors": unique_visitors,
                "page_views": page_views,
                "top_page": top_page,
            },
        }

    except Exception as exc:
        print(f"Wix Analytics error: {exc}")
        return {"success": False, "error": str(exc)}
