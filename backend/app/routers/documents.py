from pathlib import PurePath

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, status

from app.auth import User, current_user
from app.config import settings
from app.schemas import DocumentOut
from app.store import documents

router = APIRouter(prefix="/v1/documents", tags=["documents"])


@router.get("", response_model=list[DocumentOut])
def list_documents(user: User = Depends(current_user)):
    return documents.list(user.id)


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile, user: User = Depends(current_user)):
    """Validate and record an upload. File contents are discarded until ingestion is built."""
    filename = PurePath(file.filename or "").name
    if not filename:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "File must have a name")
    if PurePath(filename).suffix.lower() not in settings.allowed_extensions:
        allowed = ", ".join(settings.allowed_extensions)
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, f"Allowed file types: {allowed}")

    existing = documents.list(user.id)
    if len(existing) >= settings.max_files:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Limit of {settings.max_files} files reached")

    remaining = settings.max_total_bytes - sum(d.size_bytes for d in existing)
    size = 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > remaining:
            limit_mb = settings.max_total_bytes // (1024 * 1024)
            raise HTTPException(
                status.HTTP_413_CONTENT_TOO_LARGE, f"Uploads are limited to {limit_mb} MB combined"
            )
    if size == 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "File is empty")

    return documents.add(user.id, filename, size, file.content_type)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: str, user: User = Depends(current_user)) -> Response:
    if not documents.remove(user.id, doc_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
