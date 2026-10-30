import os

# Must run before importing the app: db.py reads it at import time.
# Overwritten, never defaulted, so tests can't touch a real database.
os.environ["DATABASE_URL"] = "postgresql+psycopg://app:app@127.0.0.1:5432/app_test"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

import app.models  # noqa: E402, F401
from app.db import Base, engine  # noqa: E402
from app.main import app  # noqa: E402

Base.metadata.create_all(engine)


@pytest.fixture
def client():
    yield TestClient(app)
    tables = ", ".join(Base.metadata.tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))
