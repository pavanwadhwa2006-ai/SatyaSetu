"""
SatyaSetu Backend — FastAPI Application Entry Point

Startup:
    uvicorn app.main:app --reload --port 8000

Production:
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api import health, auth, tenders, vendors

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks."""
    settings = get_settings()
    logger.info(
        "SatyaSetu backend starting | env=%s | version=%s",
        settings.app_env,
        settings.app_version,
    )
    logger.info("CORS allowed origins: %s", settings.allowed_origins_list)
    yield
    logger.info("SatyaSetu backend shutting down.")


# ── App ────────────────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="SatyaSetu API",
        description=(
            "AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement. "
            "Phase 1: Foundation — Database, Auth, RBAC, Core APIs."
        ),
        version=settings.app_version,
        # Only expose docs in development
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        openapi_url="/openapi.json" if settings.is_development else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Allow frontend origins to call the API.
    # CRITICAL: Do not use allow_origins=["*"] in production.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    API_PREFIX = "/api"
    app.include_router(health.router, prefix=API_PREFIX)
    app.include_router(auth.router, prefix=API_PREFIX)
    app.include_router(tenders.router, prefix=API_PREFIX)
    app.include_router(vendors.router, prefix=API_PREFIX)

    return app


app = create_app()
