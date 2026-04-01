"""Adaptive Card v1.4 formatter for monthly report."""


def _header(title: str, subtitle: str, color: str = "default") -> dict:
    return {
        "type": "TextBlock",
        "text": title,
        "weight": "bolder",
        "size": "large",
        "wrap": True,
        "style": "heading",
        "color": color,
    }


def _separator() -> dict:
    return {"type": "ColumnSet", "separator": True, "spacing": "medium", "columns": []}


def _metric_row(label: str, value: str) -> dict:
    return {
        "type": "ColumnSet",
        "spacing": "small",
        "columns": [
            {
                "type": "Column",
                "width": "stretch",
                "items": [{"type": "TextBlock", "text": label, "wrap": True}],
            },
            {
                "type": "Column",
                "width": "auto",
                "items": [{"type": "TextBlock", "text": value, "weight": "bolder", "horizontalAlignment": "right"}],
            },
        ],
    }


def _platform_section(emoji: str, name: str, metrics: list[tuple[str, str]], top_post: str | None = None) -> list[dict]:
    items: list[dict] = []
    items.append({
        "type": "TextBlock",
        "text": f"{emoji} {name}",
        "weight": "bolder",
        "size": "medium",
        "spacing": "medium",
    })
    for label, value in metrics:
        items.append(_metric_row(label, value))
    if top_post:
        items.append(_metric_row("Top post", top_post))
    return items


def _unavailable_section(emoji: str, name: str, error: str) -> list[dict]:
    return [
        {
            "type": "TextBlock",
            "text": f"{emoji} {name}",
            "weight": "bolder",
            "size": "medium",
            "spacing": "medium",
        },
        {
            "type": "TextBlock",
            "text": f"⚠️ Data unavailable — {error}",
            "wrap": True,
            "color": "warning",
            "spacing": "small",
        },
    ]


def build_monthly_card(
    month_label: str,
    linkedin: dict,
    instagram: dict,
    wix_analytics: dict,
    blog_posts: dict,
    token_warnings: list[str] | None = None,
) -> dict:
    """Build the monthly social media / website report Adaptive Card."""
    body: list[dict] = []

    body.append(_header(f"📊 DEXLab Monthly Report — {month_label}", ""))

    # Token warnings
    if token_warnings:
        for warning in token_warnings:
            body.append({
                "type": "TextBlock",
                "text": f"⚠️ {warning}",
                "wrap": True,
                "color": "warning",
                "spacing": "small",
            })

    # LinkedIn
    body.append(_separator())
    if linkedin["success"]:
        d = linkedin["data"]
        delta = f" (+{d['follower_delta']})" if d.get("follower_delta") and d["follower_delta"] > 0 else ""
        top = d.get("top_post_title", "—")
        if len(top) > 60:
            top = top[:57] + "…"
        body.extend(_platform_section("🔵", "LinkedIn", [
            ("Followers", f"{d['followers']:,}{delta}"),
            ("Impressions", f"{d['impressions']:,}"),
            ("Engagement rate", f"{d['engagement_rate']:.1f}%"),
        ], top))
    else:
        body.extend(_unavailable_section("🔵", "LinkedIn", linkedin.get("error", "check credentials")))

    # Instagram
    body.append(_separator())
    if instagram["success"]:
        d = instagram["data"]
        delta = f" (+{d['follower_delta']})" if d.get("follower_delta") and d["follower_delta"] > 0 else ""
        top = d.get("top_post_caption", "—")
        if len(top) > 60:
            top = top[:57] + "…"
        body.extend(_platform_section("🟣", "Instagram", [
            ("Followers", f"{d['followers']:,}{delta}"),
            ("Reach", f"{d['reach']:,}"),
            ("Avg engagement", f"{d['avg_engagement_rate']:.1f}%"),
        ], top))
    else:
        body.extend(_unavailable_section("🟣", "Instagram", instagram.get("error", "check credentials")))

    # Website
    body.append(_separator())
    if wix_analytics["success"]:
        d = wix_analytics["data"]
        body.extend(_platform_section("🌐", "Website", [
            ("Unique visitors", f"{d['unique_visitors']:,}"),
            ("Sessions", f"{d['sessions']:,}"),
            ("Top page", d.get("top_page", "—")),
        ]))
    else:
        body.extend(_unavailable_section("🌐", "Website", wix_analytics.get("error", "check credentials")))

    # Blog posts
    body.append(_separator())
    if blog_posts["success"]:
        posts = blog_posts["data"]
        body.append({
            "type": "TextBlock",
            "text": f"📝 New on the blog ({len(posts)} post{'s' if len(posts) != 1 else ''})",
            "weight": "bolder",
            "size": "medium",
            "spacing": "medium",
        })
        if posts:
            for p in posts:
                body.append({
                    "type": "TextBlock",
                    "text": f"· {p['title']} — {p['date']}",
                    "wrap": True,
                    "spacing": "small",
                })
        else:
            body.append({
                "type": "TextBlock",
                "text": "No new posts this month.",
                "isSubtle": True,
                "spacing": "small",
            })
    else:
        body.extend(_unavailable_section("📝", "Blog", blog_posts.get("error", "check feed URL")))

    return {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": body,
    }
