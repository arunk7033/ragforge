import time

from conftest import make_token


def test_health(client):
    assert client.get("/health").json() == {"status": "ok", "auth_configured": True}


def test_requires_token(client):
    assert client.get("/v1/me").status_code == 401


def test_rejects_expired_and_wrong_audience(client):
    expired = make_token(exp=int(time.time()) - 10)
    wrong_aud = make_token(aud="anon")
    for token in (expired, wrong_aud):
        res = client.get("/v1/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 401


def test_me(client, auth):
    body = client.get("/v1/me", headers=auth).json()
    assert body["id"] == "user-1"
    assert body["email"] == "user@example.com"
    assert body["limits"]["max_files"] == 3
    assert body["usage"] == {"files": 0, "total_bytes": 0}


def test_chat_stream_returns_placeholder(client, auth):
    payload = {"messages": [{"role": "user", "content": "What is RAG?"}]}
    with client.stream("POST", "/v1/chat/stream", json=payload, headers=auth) as res:
        assert res.status_code == 200
        text = "".join(res.iter_text())
    assert "placeholder response" in text
    assert 'You asked: "What is RAG?"' in text


def test_chat_last_message_must_be_user(client, auth):
    payload = {"messages": [{"role": "assistant", "content": "hi"}]}
    assert client.post("/v1/chat/stream", json=payload, headers=auth).status_code == 422


def test_document_upload_list_delete(client, auth):
    res = client.post("/v1/documents", files={"file": ("notes.md", b"# hello", "text/markdown")}, headers=auth)
    assert res.status_code == 201
    doc = res.json()
    assert doc["filename"] == "notes.md"
    assert doc["size_bytes"] == 7
    assert doc["status"] == "uploaded"

    assert [d["id"] for d in client.get("/v1/documents", headers=auth).json()] == [doc["id"]]
    assert client.delete(f"/v1/documents/{doc['id']}", headers=auth).status_code == 204
    assert client.get("/v1/documents", headers=auth).json() == []
    assert client.delete(f"/v1/documents/{doc['id']}", headers=auth).status_code == 404


def test_document_limits(client, auth):
    bad_type = client.post("/v1/documents", files={"file": ("run.exe", b"x")}, headers=auth)
    assert bad_type.status_code == 415

    for i in range(3):
        res = client.post("/v1/documents", files={"file": (f"f{i}.txt", b"x")}, headers=auth)
        assert res.status_code == 201
    fourth = client.post("/v1/documents", files={"file": ("f3.txt", b"x")}, headers=auth)
    assert fourth.status_code == 409


def test_document_size_limit(client, auth):
    big = b"x" * (15 * 1024 * 1024 + 1)
    res = client.post("/v1/documents", files={"file": ("big.txt", big)}, headers=auth)
    assert res.status_code == 413


def test_documents_are_per_user(client, auth):
    client.post("/v1/documents", files={"file": ("mine.txt", b"x")}, headers=auth)
    other = {"Authorization": f"Bearer {make_token(sub='user-2')}"}
    assert client.get("/v1/documents", headers=other).json() == []
