import os
from dataclasses import dataclass, field


def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    supabase_url: str = field(default_factory=lambda: os.getenv("SUPABASE_URL", "").rstrip("/"))
    # Only for Supabase projects still on the legacy shared HS256 secret; leave empty to verify via JWKS.
    supabase_jwt_secret: str = field(default_factory=lambda: os.getenv("SUPABASE_JWT_SECRET", ""))
    cors_origins: list[str] = field(
        default_factory=lambda: _csv(os.getenv("CORS_ORIGINS", "http://localhost:3000"))
    )
    max_files: int = 3
    max_total_bytes: int = 15 * 1024 * 1024
    allowed_extensions: tuple[str, ...] = (".pdf", ".txt", ".md", ".docx")

    @property
    def auth_configured(self) -> bool:
        return bool(self.supabase_jwt_secret or self.supabase_url)

    @property
    def jwks_url(self) -> str:
        return f"{self.supabase_url}/auth/v1/.well-known/jwks.json"


settings = Settings()
