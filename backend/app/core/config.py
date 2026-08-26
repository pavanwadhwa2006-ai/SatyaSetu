"""
SatyaSetu Backend — Centralized Configuration
Reads all settings from environment variables.
Uses pydantic-settings for type-safe config with validation.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All fields with no default are REQUIRED — startup will fail
    with a clear error if they are missing.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        # Extra env vars are ignored, not errors
        extra="ignore",
    )

    # ── Supabase ──────────────────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # ── CORS ──────────────────────────────────────────────────
    # Comma-separated list of allowed frontend origins
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"

    # ── Application ───────────────────────────────────────────
    app_env: str = "development"
    app_version: str = "0.1.0"

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return cached Settings instance.
    Cached so env vars are read once at startup, not on every request.
    """
    return Settings()
