"""
SatyaSetu Backend — Supabase Client Setup
Provides cached singleton clients:
  - supabase_client: uses service_role key / JWT (bypasses RLS, server-side only)
  - supabase_anon_client: uses anon key (respects RLS, for user-scoped operations)
"""

import time
import json
import hmac
import hashlib
import base64
from functools import lru_cache
try:
    import supabase._sync.client as sync_client_mod  # type: ignore
    sync_client_mod.is_valid_jwt = lambda key: True  # type: ignore
except Exception:
    pass

from supabase import create_client, Client  # type: ignore
from app.core.config import get_settings


def _generate_supabase_jwt(secret_str: str, role: str = "service_role") -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "role": role,
        "iss": "supabase",
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600 * 24 * 365,
    }

    def b64url(b: bytes) -> str:
        return base64.urlsafe_b64encode(b).decode("utf-8").rstrip("=")

    h_b = b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    p_b = b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    sig_input = f"{h_b}.{p_b}"
    sig = hmac.new(
        secret_str.encode("utf-8"), sig_input.encode("utf-8"), hashlib.sha256
    ).digest()
    sig_b = b64url(sig)
    return f"{sig_input}.{sig_b}"


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Service-role Supabase client — bypasses RLS.
    """
    settings = get_settings()
    url = settings.supabase_url
    jwt_secret = settings.supabase_jwt_secret
    anon_key = settings.supabase_anon_key

    if jwt_secret:
        token = _generate_supabase_jwt(jwt_secret, "service_role")
        client = create_client(url, token)
        if hasattr(client, "postgrest") and hasattr(client.postgrest, "session"):
            client.postgrest.session.headers["apikey"] = anon_key
            client.postgrest.session.headers["Authorization"] = f"Bearer {token}"
        return client

    return create_client(url, settings.supabase_service_role_key)


@lru_cache(maxsize=1)
def get_supabase_anon_client() -> Client:
    """
    Anonymous Supabase client — respects RLS policies.
    """
    settings = get_settings()
    url = settings.supabase_url
    jwt_secret = settings.supabase_jwt_secret
    anon_key = settings.supabase_anon_key

    if jwt_secret:
        token = _generate_supabase_jwt(jwt_secret, "anon")
        client = create_client(url, token)
        if hasattr(client, "postgrest") and hasattr(client.postgrest, "session"):
            client.postgrest.session.headers["apikey"] = anon_key
            client.postgrest.session.headers["Authorization"] = f"Bearer {token}"
        return client

    return create_client(url, settings.supabase_anon_key)
