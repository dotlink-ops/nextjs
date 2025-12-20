"""
Google Calendar Token Loader Worker
Maintains Google OAuth token in Supabase for calendar integrations
"""

import os
import json
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# ---------------------------------------
# LOGGING CONFIGURATION
# ---------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# Google OAuth scopes
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def load_credentials_from_supabase():
    """Load stored Google credentials from Supabase"""
    try:
        response = supabase.table("system_config").select("*").eq("key", "google_oauth_token").single().execute()
        if response.data:
            token_data = json.loads(response.data["value"])
            return Credentials(**token_data)
    except Exception as e:
        logger.debug(f"No existing credentials found: {e}")
    return None


def save_credentials_to_supabase(creds: Credentials):
    """Save Google credentials to Supabase"""
    token_data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes
    }
    
    supabase.table("system_config").upsert({
        "key": "google_oauth_token",
        "value": json.dumps(token_data),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()
    
    logger.info("✅ Google OAuth token saved to Supabase")


def refresh_token_if_needed():
    """Check and refresh token if expired or expiring soon"""
    creds = load_credentials_from_supabase()
    
    if not creds:
        logger.info("⚠️ No credentials found. Run initial OAuth flow first.")
        return False
    
    # Check if token is expired or will expire in the next hour
    if creds.expired or (creds.expiry and creds.expiry < datetime.utcnow() + timedelta(hours=1)):
        logger.info("🔄 Token expired or expiring soon. Refreshing...")
        
        try:
            creds.refresh(Request())
            save_credentials_to_supabase(creds)
            logger.info("✅ Token refreshed successfully")
            return True
        except Exception as e:
            logger.info(f"❌ Failed to refresh token: {e}")
            return False
    else:
        logger.info("✅ Token is valid")
        return True


def run_initial_oauth_flow():
    """Run the initial OAuth flow to get credentials"""
    client_config = {
        "installed": {
            "client_id": os.environ["GOOGLE_CLIENT_ID"],
            "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"]
        }
    }
    
    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
    creds = flow.run_local_server(port=0)
    
    save_credentials_to_supabase(creds)
    logger.info("✅ Initial OAuth flow complete")
    return creds


def main():
    """Main worker function"""
    logger.info("🔐 Google Calendar Token Loader")
    logger.info(f"⏰ Running at: {datetime.utcnow().isoformat()}")
    
    # Try to refresh existing token
    if not refresh_token_if_needed():
        logger.info("⚠️ Token refresh failed. May need to run initial OAuth flow.")
        logger.info("Run this script with --init flag to start OAuth flow.")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--init":
        logger.info("🚀 Starting initial OAuth flow...")
        run_initial_oauth_flow()
    else:
        main()
