from dataclasses import dataclass
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class User:
    id: str
    email: str | None


@lru_cache
def _jwks_client() -> jwt.PyJWKClient:
    return jwt.PyJWKClient(settings.jwks_url, cache_keys=True)


def _decode(token: str) -> dict:
    options = {"require": ["exp", "sub"]}
    issuer = f"{settings.supabase_url}/auth/v1" if settings.supabase_url else None
    if settings.supabase_jwt_secret:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=issuer,
            options=options,
        )
    signing_key = _jwks_client().get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256", "RS256"],
        audience="authenticated",
        issuer=issuer,
        options=options,
    )


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> User:
    """Verify the Supabase access token sent as `Authorization: Bearer <token>`."""
    if not settings.auth_configured:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Auth is not configured. Set SUPABASE_URL (or SUPABASE_JWT_SECRET).",
        )
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        claims = _decode(credentials.credentials)
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc
    return User(id=claims["sub"], email=claims.get("email"))
