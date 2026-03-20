"""One-time helper — run locally to obtain Microsoft Graph tokens via device flow.

Usage:
    python scripts/refresh_token.py

Then paste the printed ACCESS_TOKEN and REFRESH_TOKEN into your GitHub repo secrets.
"""

import msal

CLIENT_ID = "d3590ed6-52b3-4102-aeff-aad2292ab01c"
AUTHORITY = "https://login.microsoftonline.com/common"
SCOPES = ["Tasks.Read"]


def main() -> None:
    app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY)

    flow = app.initiate_device_flow(scopes=SCOPES)
    if "user_code" not in flow:
        raise RuntimeError(f"Device flow initiation failed: {flow}")

    print(flow["message"])
    print()

    result = app.acquire_token_by_device_flow(flow)

    if "access_token" not in result:
        raise RuntimeError(f"Token acquisition failed: {result.get('error_description', result)}")

    print("=" * 60)
    print("ACCESS_TOKEN:")
    print(result["access_token"])
    print()
    print("REFRESH_TOKEN:")
    print(result.get("refresh_token", "(none — token may not be refreshable)"))
    print("=" * 60)
    print()
    print("Paste both values into your GitHub repository secrets:")
    print("  gh secret set MS_GRAPH_TOKEN")
    print("  gh secret set MS_GRAPH_REFRESH_TOKEN")


if __name__ == "__main__":
    main()
