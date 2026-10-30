import datetime as dt

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Task

app = FastAPI()


class TaskIn(BaseModel):
    title: str
    date: dt.date


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    date: dt.date
    done: bool


class TaskPatch(BaseModel):
    title: str | None = None
    date: dt.date | None = None
    done: bool | None = None


def get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(404, "TASK_NOT_FOUND")
    return task


def clean_title(title: str) -> str:
    title = title.strip()
    if not title:
        raise HTTPException(422, "TITLE_REQUIRED")
    if len(title) > 200:
        raise HTTPException(422, "TITLE_TOO_LONG")
    return title


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/tasks", response_model=list[TaskOut])
def list_tasks(date: dt.date, db: Session = Depends(get_db)):
    query = (
        select(Task)
        .where(Task.date == date)
        .order_by(Task.done, Task.created_at, Task.id)
    )
    return db.scalars(query).all()


@app.get("/api/tasks/overdue", response_model=list[TaskOut])
def list_overdue(before: dt.date, db: Session = Depends(get_db)):
    query = (
        select(Task)
        .where(Task.date < before, Task.done.is_(False))
        .order_by(Task.date, Task.created_at, Task.id)
    )
    return db.scalars(query).all()


@app.post("/api/tasks", status_code=201, response_model=TaskOut)
def create_task(body: TaskIn, db: Session = Depends(get_db)):
    task = Task(title=clean_title(body.title), date=body.date)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.patch("/api/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, body: TaskPatch, db: Session = Depends(get_db)):
    task = get_task_or_404(db, task_id)
    changes = body.model_dump(exclude_none=True)
    if "title" in changes:
        changes["title"] = clean_title(changes["title"])
    for field, value in changes.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db.delete(get_task_or_404(db, task_id))
    db.commit()
