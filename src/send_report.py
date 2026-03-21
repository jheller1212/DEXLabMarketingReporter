"""Monthly email report — sends a formatted HTML email via Resend."""

import os
import sys
from datetime import datetime, timedelta, timezone

import requests

RESEND_API_URL = "https://api.resend.com/emails"

# Mock data — same metrics used by the dashboard
MOCK_DATA = {
    "month": "March 2026",
    "linkedin": {
        "followers": 1389,
        "follower_delta": 77,
        "impressions": 28750,
        "engagements": 1420,
        "engagement_rate": 4.9,
        "top_post": "We're hiring! Looking for a PhD candidate to join our team working on digital experimentation...",
    },
    "instagram": {
        "followers": 952,
        "follower_delta": 61,
        "reach": 17800,
        "impressions": 22100,
        "avg_engagement_rate": 5.8,
        "top_post": "Meet our newest team member! Welcome aboard. #DEXLab #NewBeginnings",
    },
    "wix": {
        "unique_visitors": 3450,
        "sessions": 5100,
        "page_views": 14200,
        "top_page": "/careers",
        "blog_posts": [
            {"title": "Open PhD Position: Digital Experimentation", "date": "Mar 03"},
            {"title": "The Role of AI in Marketing Experimentation", "date": "Mar 15"},
        ],
    },
}


def build_email_html(data: dict) -> str:
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
        if top_post:
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

    li = data["linkedin"]
    ig = data["instagram"]
    wix = data["wix"]

    linkedin_rows = (
        metric_row("Followers", f"{li['followers']:,}", f"+{li['follower_delta']}")
        + metric_row("Impressions", f"{li['impressions']:,}")
        + metric_row("Engagement Rate", f"{li['engagement_rate']:.1f}%")
    )

    instagram_rows = (
        metric_row("Followers", f"{ig['followers']:,}", f"+{ig['follower_delta']}")
        + metric_row("Reach", f"{ig['reach']:,}")
        + metric_row("Avg Engagement", f"{ig['avg_engagement_rate']:.1f}%")
    )

    wix_rows = (
        metric_row("Unique Visitors", f"{wix['unique_visitors']:,}")
        + metric_row("Sessions", f"{wix['sessions']:,}")
        + metric_row("Top Page", wix["top_page"])
    )

    blog_items = ""
    for post in wix.get("blog_posts", []):
        blog_items += f"""
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#374151;">{post['title']}</td>
          <td style="padding:6px 0;text-align:right;font-size:13px;color:#9ca3af;">{post['date']}</td>
        </tr>"""

    blog_section = ""
    if blog_items:
        blog_section = f"""
        <div style="margin-bottom:24px;">
          <div style="font-weight:600;font-size:16px;color:#111827;margin-bottom:12px;">
            New Blog Posts ({len(wix.get('blog_posts', []))})
          </div>
          <table style="width:100%;border-collapse:collapse;">{blog_items}</table>
        </div>"""

    # Summary numbers
    total_followers = li["followers"] + ig["followers"]
    total_followers_delta = li["follower_delta"] + ig["follower_delta"]

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
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">{data['month']}</p>
    </div>

    <!-- Summary strip -->
    <div style="background:#1e3a8a;padding:16px 24px;display:flex;justify-content:space-around;">
      <div style="text-align:center;">
        <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Social Followers</div>
        <div style="color:white;font-size:20px;font-weight:700;margin-top:2px;">{total_followers:,} <span style="font-size:12px;color:#86efac;">+{total_followers_delta}</span></div>
      </div>
      <div style="text-align:center;">
        <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">LI Impressions</div>
        <div style="color:white;font-size:20px;font-weight:700;margin-top:2px;">{li['impressions']:,}</div>
      </div>
      <div style="text-align:center;">
        <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Website Visitors</div>
        <div style="color:white;font-size:20px;font-weight:700;margin-top:2px;">{wix['unique_visitors']:,}</div>
      </div>
    </div>

    <!-- Content area -->
    <div style="background:white;padding:28px 24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

      {section("in", "LinkedIn", "#2563eb", linkedin_rows, li.get("top_post", ""))}

      <div style="border-top:1px solid #f3f4f6;margin:0 0 24px;"></div>

      {section("ig", "Instagram", "#ec4899", instagram_rows, ig.get("top_post", ""))}

      <div style="border-top:1px solid #f3f4f6;margin:0 0 24px;"></div>

      {section("web", "Website", "#10b981", wix_rows)}

      {f'<div style="border-top:1px solid #f3f4f6;margin:0 0 24px;"></div>' + blog_section if blog_section else ""}

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

    if resp.status_code >= 200 and resp.status_code < 300:
        print(f"Email sent successfully to {len(recipients)} recipient(s).")
        print(f"Response: {resp.json()}")
    else:
        print(f"Failed to send email: {resp.status_code} — {resp.text}")
        sys.exit(1)


def main() -> None:
    # Determine report month
    today = datetime.now(timezone.utc).date()
    last_of_prev = today.replace(day=1) - timedelta(days=1)
    month_label = last_of_prev.strftime("%B %Y")

    # Use mock data for now — will be replaced with real API calls later
    data = MOCK_DATA
    data["month"] = month_label

    print(f"Building email report for {month_label}...")
    html = build_email_html(data)

    if os.environ.get("DRY_RUN"):
        print("\nDRY RUN — Email HTML written to /tmp/dexlab_report.html")
        with open("/tmp/dexlab_report.html", "w") as f:
            f.write(html)
        return

    send_email(html, month_label)


if __name__ == "__main__":
    main()
