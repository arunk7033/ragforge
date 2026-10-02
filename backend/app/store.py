"""In-memory document metadata. Process-local and lost on restart; replace with Supabase storage."""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from threading import Lock
from uuid import uuid4


@dataclass
class Document:
    id: str
    filename: str
    size_bytes: int
    content_type: str | None
    status: str
    created_at: datetime


@dataclass
class DocumentStore:
    _docs: dict[str, list[Document]] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def list(self, user_id: str) -> list[Document]:
        with self._lock:
            return list(self._docs.get(user_id, []))

    def add(self, user_id: str, filename: str, size_bytes: int, content_type: str | None) -> Document:
        doc = Document(
            id=str(uuid4()),
            filename=filename,
            size_bytes=size_bytes,
            content_type=content_type,
            status="uploaded",
            created_at=datetime.now(UTC),
        )
        with self._lock:
            self._docs.setdefault(user_id, []).append(doc)
        return doc

    def remove(self, user_id: str, doc_id: str) -> bool:
        with self._lock:
            docs = self._docs.get(user_id, [])
            kept = [d for d in docs if d.id != doc_id]
            self._docs[user_id] = kept
            return len(kept) != len(docs)

    def clear(self) -> None:
        with self._lock:
            self._docs.clear()


documents = DocumentStore()
