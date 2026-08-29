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
import re
from functools import lru_cache

try:
    import supabase._sync.client as sync_client_mod  # type: ignore
    
    # Patch SyncClient regex check to support sb_publishable_ and sb_secret_ key formats
    orig_sync_init = sync_client_mod.SyncClient.__init__
    
    def _flexible_sync_init(self, supabase_url: str, supabase_key: str, options=None):
        old_match = re.match
        def flexible_match(pattern, string, flags=0):
            if string == supabase_key:
                return True
            return old_match(pattern, string, flags)
        
        re.match = flexible_match
        try:
            orig_sync_init(self, supabase_url, supabase_key, options)
        finally:
            re.match = old_match
            
    sync_client_mod.SyncClient.__init__ = _flexible_sync_init
except Exception:
    pass

from supabase import create_client, Client  # type: ignore
from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Service-role Supabase client — bypasses RLS (server-side only).
    """
    settings = get_settings()
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


@lru_cache(maxsize=1)
def get_supabase_anon_client() -> Client:
    """
    Anonymous Supabase client — respects RLS policies.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)

