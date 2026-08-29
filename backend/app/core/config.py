"""
SatyaSetu Backend — Centralized Configuration
Reads all settings from environment variables.
Uses pydantic-settings for type-safe config with validation.
"""

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve absolute paths to .env in both root and backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATHS = (
    str(BASE_DIR / ".env"),
    str(BASE_DIR / "backend" / ".env"),
    ".env",
    "backend/.env",
)


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Reads .env files automatically across working directories.
    """

    model_config = SettingsConfigDict(
        env_file=ENV_PATHS,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Supabase ──────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # ── Gemini AI ─────────────────────────────────────────────
    gemini_api_key: str = ""
    google_api_key: str = ""

    # ── CORS ──────────────────────────────────────────────────
    # Explicitly allow http://localhost:3000 and http://localhost:3001
    allowed_origins: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"

    # ── Application ───────────────────────────────────────────
    app_env: str = "development"
    app_version: str = "0.1.0"

    @property
    def effective_gemini_api_key(self) -> str:
        """Return Gemini API key from settings or OS environment."""
        return self.gemini_api_key or self.google_api_key or os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a clean list."""
        origins = [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        # Guarantee default origins if empty
        defaults = ["http://localhost:3000", "http://localhost:3001"]
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins

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
