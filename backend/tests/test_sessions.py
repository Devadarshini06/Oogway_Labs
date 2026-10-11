import pytest
import httpx
import uuid

@pytest.mark.asyncio
async def test_session_lifecycle_and_isolation(async_client: httpx.AsyncClient):
    """Verify session creation, persistence, isolation, and deletion."""
    # 1. Create Session A
    res_a = await async_client.post("/api/v1/sessions", json={"title": "Session A"})
    assert res_a.status_code == 201
    session_a = res_a.json()
    id_a = session_a["id"]
    assert session_a["title"] == "Session A"

    # 2. Create Session B
    res_b = await async_client.post("/api/v1/sessions", json={"title": "Session B"})
    assert res_b.status_code == 201
    session_b = res_b.json()
    id_b = session_b["id"]
    assert session_b["title"] == "Session B"

    # 3. List sessions
    list_res = await async_client.get("/api/v1/sessions")
    assert list_res.status_code == 200
    sessions_list = list_res.json()["sessions"]
    ids = [s["id"] for s in sessions_list]
    assert id_a in ids
    assert id_b in ids

    # 4. Post message into Session A
    msg_res_a = await async_client.post(
        "/api/v1/chat",
        json={"session_id": id_a, "message": "Hello in session A", "enable_rag": False}
    )
    assert msg_res_a.status_code == 200

    # 5. Verify Session A has messages, but Session B has 0 messages
    msgs_a = await async_client.get(f"/api/v1/sessions/{id_a}/messages")
    assert msgs_a.status_code == 200
    assert len(msgs_a.json()["messages"]) >= 2  # user + assistant

    msgs_b = await async_client.get(f"/api/v1/sessions/{id_b}/messages")
    assert msgs_b.status_code == 200
    assert len(msgs_b.json()["messages"]) == 0  # Isolated context!

    # 6. Delete Session A
    del_res = await async_client.delete(f"/api/v1/sessions/{id_a}")
    assert del_res.status_code == 204

    # 7. Confirm Session A returns 404
    get_res = await async_client.get(f"/api/v1/sessions/{id_a}")
    assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_invalid_session_id_handling(async_client: httpx.AsyncClient):
    """Verify clean 404 on nonexistent session ID."""
    fake_id = str(uuid.uuid4())
    res = await async_client.get(f"/api/v1/sessions/{fake_id}")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()
