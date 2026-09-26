from functools import lru_cache
from pathlib import Path
import sys
import urllib.parse
from pydantic_settings import BaseSettings, SettingsConfigDict

# Add project root and backend dir to sys.path
_root = str(Path(__file__).resolve().parent.parent)
_backend = str(Path(__file__).resolve().parent)
if _root not in sys.path:
    sys.path.insert(0, _root)
if _backend not in sys.path:
    sys.path.insert(0, _backend)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parent / ".env",
            Path(__file__).resolve().parent.parent / ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = ""
    GOOGLE_AI_API_KEY: str = ""
    GEE_SERVICE_ACCOUNT_EMAIL: str = ""
    GEE_PRIVATE_KEY_JSON: str = ""
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_ALERT_CHAT_ID: str = ""
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    STORM_POLL_INTERVAL_MINUTES: int = 30
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        if not url:
            return "postgresql+asyncpg://postgres:postgres@localhost:5432/cycloneguard"

        # Determine scheme prefix
        for prefix in ("postgresql+asyncpg://", "postgresql://", "postgres://"):
            if url.startswith(prefix):
                url = url[len(prefix):]
                break

        # Handle user:password@host...
        if "@" in url:
            auth_part, host_part = url.rsplit("@", 1)
            if ":" in auth_part:
                user, pwd = auth_part.split(":", 1)
                pwd = urllib.parse.unquote(pwd)
                encoded_pwd = urllib.parse.quote_plus(pwd)
                url = f"{user}:{encoded_pwd}@{host_part}"
            else:
                url = f"{auth_part}@{host_part}"

        return f"postgresql+asyncpg://{url}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
