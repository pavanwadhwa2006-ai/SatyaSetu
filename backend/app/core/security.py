"""
SatyaSetu Backend — Security / JWT Utilities
Handles Supabase JWT verification and user identity extraction.

Security model:
  1. Frontend sends Supabase Auth JWT in Authorization: Bearer <token>
  2. Backend verifies JWT signature using SUPABASE_JWT_SECRET
  3. Backend extracts user_id (sub) from verified JWT
  4. Backend looks up user_profiles table (via service_role) to get role
  5. Role from DB is used for RBAC — never role from JWT claims

This prevents role escalation: a malicious JWT claiming "officer" role
will still be denied if the DB says the user is a "bidder".
"""

import logging
from typing import Optional
import jwt
from jwt import PyJWTError
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def verify_supabase_jwt(token: str) -> Optional[dict]:
    """
    Verify a Supabase-issued JWT and return its decoded payload.

    Returns None if the token is invalid, expired, or malformed.
    Logs the reason for failure (without logging the token itself).

    Args:
        token: Raw JWT string (without "Bearer " prefix)

    Returns:
        Decoded JWT payload dict if valid, None otherwise
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT validation failed: token expired")
        return None
    except jwt.InvalidAudienceError:
        logger.warning("JWT validation failed: invalid audience")
        return None
    except PyJWTError as exc:
        logger.warning("JWT validation failed: %s", type(exc).__name__)
        return None


def extract_user_id_from_payload(payload: dict) -> Optional[str]:
    """
    Extract the Supabase user ID (UUID) from a verified JWT payload.
    Supabase stores the user UUID in the 'sub' claim.
    """
    return payload.get("sub")
