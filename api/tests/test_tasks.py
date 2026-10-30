import datetime as dt

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import Task


def count_tasks():
    with SessionLocal() as db:
        return db.scalar(select(func.count()).select_from(Task))


def add_task(title, date, done=False):
    with SessionLocal() as db:
        db.add(Task(title=title, date=dt.date.fromisoformat(date), done=done))
        db.commit()


def titles(response):
    return [t["title"] for t in response.json()]


def test_create_task(client):
    response = client.post("/api/tasks", json={"title": "Buy bread", "date": "2026-10-21"})
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Buy bread"
    assert body["date"] == "2026-10-21"
    assert body["done"] is False


def test_create_task_blank_title(client):
    response = client.post("/api/tasks", json={"title": "   ", "date": "2026-10-21"})
    assert response.status_code == 422
    assert response.json() == {"detail": "TITLE_REQUIRED"}
    assert count_tasks() == 0


def test_create_task_title_too_long(client):
    response = client.post("/api/tasks", json={"title": "x" * 201, "date": "2026-10-21"})
    assert response.status_code == 422
    assert response.json() == {"detail": "TITLE_TOO_LONG"}
    assert count_tasks() == 0


def test_day_lists_pending_first(client):
    add_task("Done early", "2026-10-21", done=True)
    add_task("Pending later", "2026-10-21")
    response = client.get("/api/tasks", params={"date": "2026-10-21"})
    assert response.status_code == 200
    assert titles(response) == ["Pending later", "Done early"]


def test_day_hides_other_days(client):
    add_task("Yesterday", "2026-10-20")
    add_task("Today", "2026-10-21")
    add_task("Tomorrow", "2026-10-22")
    response = client.get("/api/tasks", params={"date": "2026-10-21"})
    assert titles(response) == ["Today"]


def test_overdue_lists_only_earlier_pending(client):
    add_task("Pending yesterday", "2026-10-20")
    add_task("Pending two days ago", "2026-10-19")
    add_task("Done yesterday", "2026-10-20", done=True)
    add_task("Pending today", "2026-10-21")
    response = client.get("/api/tasks/overdue", params={"before": "2026-10-21"})
    assert response.status_code == 200
    assert titles(response) == ["Pending two days ago", "Pending yesterday"]


def create(client, title="Run", date="2026-10-21"):
    return client.post("/api/tasks", json={"title": title, "date": date}).json()


def test_toggle_done(client):
    task = create(client)
    response = client.patch(f"/api/tasks/{task['id']}", json={"done": True})
    assert response.status_code == 200
    assert response.json()["done"] is True


def test_reschedule_leaves_day(client):
    task = create(client)
    client.patch(f"/api/tasks/{task['id']}", json={"date": "2026-10-22"})
    assert titles(client.get("/api/tasks", params={"date": "2026-10-21"})) == []
    assert titles(client.get("/api/tasks", params={"date": "2026-10-22"})) == ["Run"]


def test_edit_blank_title(client):
    task = create(client)
    response = client.patch(f"/api/tasks/{task['id']}", json={"title": "  "})
    assert response.status_code == 422
    assert response.json() == {"detail": "TITLE_REQUIRED"}


def test_delete_task(client):
    task = create(client)
    response = client.delete(f"/api/tasks/{task['id']}")
    assert response.status_code == 204
    assert count_tasks() == 0


def test_unknown_task(client):
    for response in [
        client.patch("/api/tasks/999", json={"done": True}),
        client.delete("/api/tasks/999"),
    ]:
        assert response.status_code == 404
        assert response.json() == {"detail": "TASK_NOT_FOUND"}
