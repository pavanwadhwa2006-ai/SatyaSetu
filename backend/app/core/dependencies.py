"""
SatyaSetu Backend — FastAPI Dependency Injection
Provides reusable dependencies for route handlers.

Usage in routes:
    @router.get("/protected")
    def protected_route(user: CurrentUser = Depends(get_current_user)):
        ...

    @router.post("/officer-only")
    def officer_route(user: CurrentUser = Depends(require_officer)):
        ...
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import verify_supabase_jwt, extract_user_id_from_payload
from app.core.database import get_supabase_client
from app.schemas.auth import CurrentUser

logger = logging.getLogger(__name__)

# HTTPBearer extracts the token from "Authorization: Bearer <token>"
# auto_error=False means we handle the 401 ourselves for better messages
_bearer_scheme = HTTPBearer(auto_error=False)


def _get_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> Optional[str]:
    """Extract raw JWT string from Authorization header, or None."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials
    return None


async def get_current_user(token: Optional[str] = Depends(_get_token)) -> CurrentUser:
    """
    Dependency: require an authenticated user.
    Raises HTTP 401 if no valid token is present.
    Raises HTTP 403 if user has no profile in DB (setup issue).

    Role is fetched from user_profiles table, NOT from JWT claims.
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_supabase_jwt(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = extract_user_id_from_payload(payload)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a user identifier.",
        )

    # Fetch role and profile from DB (service_role bypasses RLS for this lookup)
    client = get_supabase_client()
    try:
        response = (
            client.table("user_profiles")
            .select("id, role, full_name, organization, designation")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except Exception as exc:
        logger.error("DB error fetching user profile for %s: %s", user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify user identity. Please try again.",
        )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account exists but has no application profile. Contact administrator.",
        )

    profile = response.data
    return CurrentUser(
        id=profile["id"],
        role=profile["role"],
        full_name=profile.get("full_name"),
        organization=profile.get("organization"),
        designation=profile.get("designation"),
    )


async def get_current_user_optional(
    token: Optional[str] = Depends(_get_token),
) -> Optional[CurrentUser]:
    """
    Dependency: optionally authenticate. Returns None for unauthenticated requests.
    Use for endpoints that behave differently for auth vs. anon users.
    """
    if token is None:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None


def require_role(*roles: str):
    """
    Dependency factory: require the current user to have one of the given roles.

    Usage:
        require_officer = require_role("PROCUREMENT_OFFICER")

        @router.post("/tenders")
        def create(user = Depends(require_officer)):
            ...
    """
    async def _require_role(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {' or '.join(roles)}. Your role: {user.role}.",
            )
        return user
    return _require_role


# ── Convenience pre-built dependencies ────────────────────────────────────────

require_officer = require_role("PROCUREMENT_OFFICER")
require_bidder = require_role("BIDDER")
require_any_authenticated = get_current_user
