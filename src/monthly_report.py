"""Monthly social media and website report — orchestrator."""

import os
import sys
from datetime import datetime, timedelta, timezone

import msal

from instagram import fetch_instagram_data
from linkedin import fetch_linkedin_data
from post_to_teams import post_card
from teams_card import build_monthly_card
from wix import fetch_blog_posts, fetch_wix_analytics

CLIENT_ID = "d3590ed6-52b3-4102-aeff-aad2292ab01c"
AUTHORITY = "https://login.microsoftonline.com/common"
SCOPES = ["Chat.ReadWrite"]


def get_graph_token() -> str:
    """Acquire a Graph token for posting to Teams chat."""
    refresh_token = os.environ["MS_GRAPH_REFRESH_TOKEN"]
    client_id = os.environ.get("MS_GRAPH_CLIENT_ID", CLIENT_ID)

    app = msal.PublicClientApplication(client_id, authority=AUTHORITY)
    result = app.acquire_token_by_refresh_token(refresh_token, scopes=SCOPES)

    if "access_token" not in result:
        print(f"Token refresh failed: {result.get('error_description', result)}")
        sys.exit(1)

    return result["access_token"]


def main() -> None:
    today = datetime.now(timezone.utc).date()
    # Report covers the prior month
    last_of_prev_month = today.replace(day=1) - timedelta(days=1)
    month_label = last_of_prev_month.strftime("%B %Y")

    print(f"Building monthly report for {month_label}…")

    token_warnings: list[str] = []

    print("Fetching LinkedIn data…")
    linkedin = fetch_linkedin_data()
    if not linkedin["success"]:
        print(f"  LinkedIn failed: {linkedin['error']}")

    print("Fetching Instagram data…")
    instagram, ig_warning = fetch_instagram_data()
    if not instagram["success"]:
        print(f"  Instagram failed: {instagram['error']}")
    if ig_warning:
        token_warnings.append(ig_warning)
        print(f"  Token warning: {ig_warning}")

    print("Fetching Wix analytics…")
    wix_analytics = fetch_wix_analytics()
    if not wix_analytics["success"]:
        print(f"  Wix analytics failed: {wix_analytics['error']}")

    print("Fetching blog posts…")
    blog_posts = fetch_blog_posts()
    if not blog_posts["success"]:
        print(f"  Blog feed failed: {blog_posts['error']}")

    card = build_monthly_card(
        month_label=month_label,
        linkedin=linkedin,
        instagram=instagram,
        wix_analytics=wix_analytics,
        blog_posts=blog_posts,
        token_warnings=token_warnings if token_warnings else None,
    )

    print("Acquiring Graph token for Teams…")
    graph_token = get_graph_token()
    post_card(card, token=graph_token)


if __name__ == "__main__":
    main()
