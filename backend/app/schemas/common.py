"""
SatyaSetu Backend — Common Response Schemas
Shared Pydantic models used across multiple endpoints.
"""

from typing import Any, Optional
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response body."""
    detail: str

    model_config = {"json_schema_extra": {"example": {"detail": "Resource not found."}}}


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    environment: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "version": "0.1.0",
                "environment": "development",
            }
        }
    }


class PaginatedResponse(BaseModel):
    """Generic paginated list wrapper."""
    items: list[Any]
    total: int
    page: int
    page_size: int
