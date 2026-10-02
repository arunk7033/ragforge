import os
import time

import jwt
import pytest

os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_JWT_SECRET"] = "test-secret-at-least-32-bytes-long!!"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.store import documents  # noqa: E402


def make_token(sub: str = "user-1", email: str = "user@example.com", **overrides) -> str:
    claims = {
        "sub": sub,
        "email": email,
        "aud": "authenticated",
        "iss": "https://test.supabase.co/auth/v1",
        "exp": int(time.time()) + 3600,
        **overrides,
    }
    return jwt.encode(claims, os.environ["SUPABASE_JWT_SECRET"], algorithm="HS256")


@pytest.fixture
def client():
    documents.clear()
    return TestClient(app)


@pytest.fixture
def auth():
    return {"Authorization": f"Bearer {make_token()}"}
