"""Weekly email report — sends a LinkedIn-focused HTML email via Resend."""

import os
import sys
from datetime import datetime, timezone

import requests

from linkedin import fetch_linkedin_data

RESEND_API_URL = "https://api.resend.com/emails"


def build_weekly_html(linkedin: dict) -> str:
    """Build a professional weekly HTML email from LinkedIn data."""

    today = datetime.now(timezone.utc).date()
    week_label = today.strftime("%d %B %Y")

    if linkedin["success"]:
        li = linkedin["data"]
        metrics_html = f"""
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Followers</td>
            <td style="padding:12px 0;text-align:right;font-weight:700;font-size:18px;color:#1e40af;">{li['followers']:,}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Total Impressions</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['impressions']:,}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Unique Impressions</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['unique_impressions']:,}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Engagement Rate</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['engagement_rate']:.1f}%</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Likes</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['likes']:,}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Comments</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['comments']:,}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Shares</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['shares']:,}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:12px 0;color:#6b7280;font-size:14px;">Link Clicks</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;font-size:14px;">{li['clicks']:,}</td>
          </tr>
        </table>"""
    else:
        metrics_html = f"""
        <div style="padding:16px;background:#fef3c7;border-radius:8px;border-left:3px solid #f59e0b;font-size:14px;color:#92400e;">
          LinkedIn data unavailable &mdash; {linkedin.get('error', 'unknown error')}
        </div>"""

    summary_strip = ""
    if linkedin["success"]:
        li = linkedin["data"]
        summary_strip = f"""
        <div style="background:#1e3a8a;padding:16px 24px;display:flex;justify-content:space-around;">
          <div style="text-align:center;">
            <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Followers</div>
            <div style="color:white;font-size:22px;font-weight:700;margin-top:2px;">{li['followers']:,}</div>
          </div>
          <div style="text-align:center;">
            <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Impressions</div>
            <div style="color:white;font-size:22px;font-weight:700;margin-top:2px;">{li['impressions']:,}</div>
          </div>
          <div style="text-align:center;">
            <div style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Engagement</div>
            <div style="color:white;font-size:22px;font-weight:700;margin-top:2px;">{li['engagement_rate']:.1f}%</div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#2563eb);border-radius:16px 16px 0 0;padding:28px 24px;text-align:center;">
      <div style="display:inline-block;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.2);line-height:40px;text-align:center;">
        <span style="color:white;font-weight:700;font-size:16px;">DX</span>
      </div>
      <h1 style="color:white;font-size:22px;margin:10px 0 4px;font-weight:700;">DEXLab Weekly LinkedIn Report</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Week of {week_label}</p>
    </div>

    {summary_strip}

    <!-- Content -->
    <div style="background:white;padding:24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

      <div style="display:flex;align-items:center;margin-bottom:16px;">
        <div style="width:32px;height:32px;border-radius:8px;background:#2563eb;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:700;line-height:32px;text-align:center;">in</div>
        <span style="margin-left:10px;font-weight:600;font-size:16px;color:#111827;">LinkedIn Analytics</span>
      </div>

      {metrics_html}

      <!-- Dashboard link -->
      <div style="margin-top:24px;text-align:center;">
        <a href="https://jheller1212.github.io/DEXLabMarketingReporter/" style="display:inline-block;padding:12px 28px;background:#0077B5;color:white;font-weight:600;font-size:14px;text-decoration:none;border-radius:8px;">View Full Dashboard &rarr;</a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;color:#9ca3af;font-size:12px;">
      DEXLab &middot; School of Business and Economics &middot; Maastricht University<br>
      <span style="font-size:11px;">Automated weekly report &mdash; reply to this email for questions.</span>
    </div>

  </div>
</body>
</html>"""


def send_email(html: str) -> None:
    """Send the weekly report email via Resend API."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print("RESEND_API_KEY not set.")
        sys.exit(1)

    recipients_raw = os.environ.get("REPORT_RECIPIENTS", "")
    if not recipients_raw:
        print("REPORT_RECIPIENTS not set.")
        sys.exit(1)

    recipients = [e.strip() for e in recipients_raw.split(",") if e.strip()]
    today = datetime.now(timezone.utc).date()
    week_label = today.strftime("%d %b %Y")

    resp = requests.post(
        RESEND_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": os.environ.get("REPORT_FROM", "DEXLab Reports <onboarding@resend.dev>"),
            "to": recipients,
            "subject": f"DEXLab Weekly LinkedIn Report - {week_label}",
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
    print("Building weekly LinkedIn report...")

    print("Fetching LinkedIn data...")
    linkedin = fetch_linkedin_data()
    if linkedin["success"]:
        li = linkedin["data"]
        print(f"  Followers: {li['followers']:,}")
        print(f"  Impressions: {li['impressions']:,}")
        print(f"  Engagement: {li['engagement_rate']:.1f}%")
    else:
        print(f"  LinkedIn failed: {linkedin['error']}")

    html = build_weekly_html(linkedin)

    if os.environ.get("DRY_RUN"):
        print("\nDRY RUN — HTML written to /tmp/dexlab_weekly.html")
        with open("/tmp/dexlab_weekly.html", "w") as f:
            f.write(html)
        return

    send_email(html)


if __name__ == "__main__":
    main()
