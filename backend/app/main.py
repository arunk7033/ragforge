from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import chat, documents, me

app = FastAPI(
    title="ragforge API",
    version="0.1.0",
    description="Placeholder API: responses are canned until retrieval and generation are built.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(me.router)
app.include_router(chat.router)
app.include_router(documents.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "auth_configured": settings.auth_configured}
