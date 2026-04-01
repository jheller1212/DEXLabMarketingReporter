"""Monthly email report — sends a formatted HTML email via Resend."""

import os
import sys
from datetime import datetime, timedelta, timezone

import requests

from linkedin import fetch_linkedin_data
from instagram import fetch_instagram_data
from wix import fetch_wix_analytics, fetch_blog_posts

RESEND_API_URL = "https://api.resend.com/emails"


def _unavailable_section(icon: str, title: str, color: str, error: str) -> str:
    return f"""
    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <div style="width:32px;height:32px;border-radius:8px;background:{color};display:inline-flex;align-items:center;justify-content:center;color:white;font-size:16px;line-height:32px;text-align:center;">
          {icon}
        </div>
        <span style="margin-left:10px;font-weight:600;font-size:16px;color:#111827;">{title}</span>
      </div>
      <div style="padding:10px 12px;background:#fef3c7;border-radius:8px;border-left:3px solid #f59e0b;font-size:14px;color:#92400e;">
        Data unavailable &mdash; {error}
      </div>
    </div>"""


def build_email_html(month_label: str, linkedin: dict, instagram: dict, wix_analytics: dict, blog_posts: dict, warnings: list[str]) -> str:
    """Build a professional HTML email from report data."""

    def metric_row(label: str, value: str, delta: str = "") -> str:
        delta_html = ""
        if delta:
            color = "#10b981" if delta.startswith("+") else "#ef4444"
            delta_html = f'<span style="color:{color};font-size:13px;margin-left:6px;">{delta}</span>'
        return f"""
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">{label}</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;">
            {value}{delta_html}
          </td>
        </tr>"""

    def section(icon: str, title: str, color: str, rows: str, top_post: str = "") -> str:
        top_html = ""
        if top_post and top_post != "—":
            truncated = top_post[:80] + "..." if len(top_post) > 80 else top_post
            top_html = f"""
            <div style="margin-top:12px;padding:10px 12px;background:#f9fafb;border-radius:8px;border-left:3px solid {color};">
              <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">TOP POST</div>
              <div style="font-size:13px;color:#4b5563;">{truncated}</div>
            </div>"""
        return f"""
        <div style="margin-bottom:24px;">
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <div style="width:32px;height:32px;border-radius:8px;background:{color};display:inline-flex;align-items:center;justify-content:center;color:white;font-size:16px;line-height:32px;text-align:center;">
              {icon}
            </div>
            <span style="margin-left:10px;font-weight:600;font-size:16px;color:#111827;">{title}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;">{rows}</table>
          {top_html}
        </div>"""

    # Build platform sections
    if linkedin["success"]:
        li = linkedin["data"]
        delta = f"+{li['follower_delta']}" if li.get("follower_delta") else ""
        linkedin_html = section("in", "LinkedIn", "#2563eb",
            metric_row("Followers", f"{li['followers']:,}", delta)
            + metric_row("Impressions", f"{li['impressions']:,}")
            + metric_row("Engagement Rate", f"{li['engagement_rate']:.1f}%"),
            li.get("top_post_title", ""))
    else:
        linkedin_html = _unavailable_section("in", "LinkedIn", "#2563eb", linkedin.get("error", "unknown"))

    if instagram["success"]:
        ig = instagram["data"]
        delta = f"+{ig['follower_delta']}" if ig.get("follower_delta") else ""
        instagram_html = section("ig", "Instagram", "#ec4899",
            metric_row("Followers", f"{ig['followers']:,}", delta)
            + metric_row("Reach", f"{ig['reach']:,}")
            + metric_row("Avg Engagement", f"{ig['avg_engagement_rate']:.1f}%"),
            ig.get("top_post_caption", ""))
    else:
        instagram_html = _unavailable_section("ig", "Instagram", "#ec4899", instagram.get("error", "unknown"))

    if wix_analytics["success"]:
        wix = wix_analytics["data"]
        wix_html = section("web", "Website", "#10b981",
            metric_row("Unique Visitors", f"{wix['unique_visitors']:,}")
            + metric_row("Sessions", f"{wix['sessions']:,}")
            + metric_row("Top Page", wix.get("top_page", "—")))
    else:
        wix_html = _unavailable_section("web", "Website", "#10b981", wix_analytics.get("error", "unknown"))

    # Blog posts
    blog_html = ""
    if blog_posts["success"]:
        posts = blog_posts["data"]
        if posts:
            blog_items = ""
            for post in posts:
                blog_items += f"""
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#374151;">{post['title']}</td>
                  <td style="padding:6px 0;text-align:right;font-size:13px;color:#9ca3af;">{post['date']}</td>
                </tr>"""
            blog_html = f"""
            <div style="border-top:1px solid #f3f4f6;margin:0 0 24px;"></div>
            <div style="margin-bottom:24px;">
              <div style="font-weight:600;font-size:16px;color:#111827;margin-bottom:12px;">
                New Blog Posts ({len(posts)})
              </div>
              <table style="width:100%;border-collapse:collapse;">{blog_items}</table>
            </div>"""

    # Warnings banner
    warnings_html = ""
    if warnings:
        items = "".join(f"<div style='margin-bottom:4px;'>{w}</div>" for w in warnings)
        warnings_html = f"""
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#92400e;">
          {items}
        </div>"""

    # Summary strip — only show numbers we have
    summary_parts = []
    if linkedin["success"]:
        summary_parts.append(("LI Followers", f"{linkedin['data']['followers']:,}"))
    if instagram["success"]:
        summary_parts.append(("IG Followers", f"{instagram['data']['followers']:,}"))
    if wix_analytics["success"]:
        summary_parts.append(("Website Visitors", f"{wix_analytics['data']['unique_visitors']:,}"))

    summary_cells = ""
    for label, value in summary_parts:
        summary_cells += f"""
        <div style="text-align:center;">
          <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">{label}</div>
          <div style="color:white;font-size:20px;font-weight:700;margin-top:2px;">{value}</div>
        </div>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#2563eb);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
      <div style="display:inline-block;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.2);line-height:40px;text-align:center;">
        <span style="color:white;font-weight:700;font-size:16px;">DX</span>
      </div>
      <h1 style="color:white;font-size:24px;margin:12px 0 4px;font-weight:700;">DEXLab Monthly Report</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">{month_label}</p>
    </div>

    <!-- Summary strip -->
    <div style="background:#1e3a8a;padding:16px 24px;display:flex;justify-content:space-around;">
      {summary_cells}
    </div>

    <!-- Content area -->
    <div style="background:white;padding:28px 24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

      {warnings_html}

      {linkedin_html}

      <div style="border-top:1px solid #f3f4f6;margin:0 0 24px;"></div>

      {instagram_html}

      <div style="border-top:1px solid #f3f4f6;margin:0 0 24px;"></div>

      {wix_html}

      {blog_html}

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;color:#9ca3af;font-size:12px;">
      DEXLab &middot; School of Business and Economics &middot; Maastricht University
    </div>

  </div>
</body>
</html>"""


def send_email(html: str, month_label: str) -> None:
    """Send the report email via the Resend API."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print("RESEND_API_KEY not set.")
        sys.exit(1)

    recipients_raw = os.environ.get("REPORT_RECIPIENTS", "")
    if not recipients_raw:
        print("REPORT_RECIPIENTS not set.")
        sys.exit(1)

    recipients = [e.strip() for e in recipients_raw.split(",") if e.strip()]

    resp = requests.post(
        RESEND_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": os.environ.get("REPORT_FROM", "DEXLab Reports <onboarding@resend.dev>"),
            "to": recipients,
            "subject": f"DEXLab Monthly Report - {month_label}",
            "html": html,
        },
        timeout=30,
    )

    if 200 <= resp.status_code < 300:
        print(f"Email sent successfully to {len(recipients)} recipient(s).")
        print(f"Response: {resp.json()}")
    else:
        print(f"Failed to send email: {resp.status_code} — {resp.text}")
        sys.exit(1)


def main() -> None:
    today = datetime.now(timezone.utc).date()
    last_of_prev = today.replace(day=1) - timedelta(days=1)
    month_label = last_of_prev.strftime("%B %Y")

    print(f"Building email report for {month_label}...")
    warnings: list[str] = []

    print("Fetching LinkedIn data...")
    linkedin = fetch_linkedin_data()
    if not linkedin["success"]:
        print(f"  LinkedIn failed: {linkedin['error']}")

    print("Fetching Instagram data...")
    instagram, ig_warning = fetch_instagram_data()
    if not instagram["success"]:
        print(f"  Instagram failed: {instagram['error']}")
    if ig_warning:
        warnings.append(ig_warning)
        print(f"  Token warning: {ig_warning}")

    print("Fetching Wix analytics...")
    wix_analytics = fetch_wix_analytics()
    if not wix_analytics["success"]:
        print(f"  Wix analytics failed: {wix_analytics['error']}")

    print("Fetching blog posts...")
    blog = fetch_blog_posts()
    if not blog["success"]:
        print(f"  Blog feed failed: {blog['error']}")

    html = build_email_html(month_label, linkedin, instagram, wix_analytics, blog, warnings)

    if os.environ.get("DRY_RUN"):
        print("\nDRY RUN — Email HTML written to /tmp/dexlab_report.html")
        with open("/tmp/dexlab_report.html", "w") as f:
            f.write(html)
        return

    send_email(html, month_label)


if __name__ == "__main__":
    main()
