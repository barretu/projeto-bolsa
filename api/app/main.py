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
