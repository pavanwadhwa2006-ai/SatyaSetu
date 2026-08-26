"""
SatyaSetu Backend — Auth Endpoints
GET /api/auth/me — return current authenticated user and their DB role
"""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.schemas.auth import CurrentUser, MeResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get current authenticated user",
    description=(
        "Returns the authenticated user's ID, role (from database — never from JWT claims), "
        "and profile information. Requires a valid Supabase Auth Bearer token."
    ),
    responses={
        401: {"description": "Missing or invalid token"},
        403: {"description": "User has no application profile"},
        503: {"description": "Database unavailable"},
    },
)
async def get_me(current_user: CurrentUser = Depends(get_current_user)) -> MeResponse:
    return MeResponse(user=current_user)
