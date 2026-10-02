from fastapi import APIRouter, Depends

from app.auth import User, current_user
from app.config import settings
from app.schemas import Limits, MeOut, Usage
from app.store import documents

router = APIRouter(prefix="/v1", tags=["account"])


@router.get("/me", response_model=MeOut)
def me(user: User = Depends(current_user)) -> MeOut:
    docs = documents.list(user.id)
    return MeOut(
        id=user.id,
        email=user.email,
        limits=Limits(
            max_files=settings.max_files,
            max_total_bytes=settings.max_total_bytes,
            allowed_extensions=list(settings.allowed_extensions),
        ),
        usage=Usage(files=len(docs), total_bytes=sum(d.size_bytes for d in docs)),
    )
