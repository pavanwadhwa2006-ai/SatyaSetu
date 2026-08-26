"""
SatyaSetu Backend — Health Check Endpoint
GET /api/health
"""

from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns backend status, version, and environment. No authentication required.",
)
def health_check() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        environment=settings.app_env,
    )
