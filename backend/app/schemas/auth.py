"""
SatyaSetu Backend — Auth Schemas
Pydantic models for authentication and user representation.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class CurrentUser(BaseModel):
    """
    Represents an authenticated user, as returned by get_current_user dependency.
    Role is always sourced from user_profiles DB table — never from JWT claims.
    """
    id: str = Field(..., description="Supabase auth user UUID")
    role: Literal["BIDDER", "PROCUREMENT_OFFICER"] = Field(
        ..., description="Application role (always from DB, never from JWT)"
    )
    full_name: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "role": "PROCUREMENT_OFFICER",
                "full_name": "Ananya Mehta",
                "organization": "Government Procurement Department",
                "designation": "Senior Procurement Officer",
            }
        }
    }


class MeResponse(BaseModel):
    """Response for GET /api/auth/me"""
    user: CurrentUser
    message: str = "Authenticated successfully."
