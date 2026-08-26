"""
SatyaSetu Backend — Supabase Client Setup
Provides two clients:
  - supabase_client: uses service_role key (bypasses RLS, server-side only)
  - supabase_anon_client: uses anon key (respects RLS, for user-scoped operations)

CRITICAL: supabase_client with service_role key must NEVER be passed to
or used for frontend-originating requests without proper RBAC checks.
"""

from functools import lru_cache
from supabase import create_client, Client
from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Service-role Supabase client — bypasses RLS.
    Use for: RBAC lookups, admin operations, seed scripts.
    NEVER expose this to frontend requests directly.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache(maxsize=1)
def get_supabase_anon_client() -> Client:
    """
    Anonymous Supabase client — respects RLS policies.
    Use for: public-facing operations not requiring privileged access.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)
