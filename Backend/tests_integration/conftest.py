import pytest
import pytest_asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import get_db, Base

# Use a file-based SQLite DB for integration tests by default
TEST_DB_FILE = "./test_integration.db"
DEFAULT_DB_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"
SQLALCHEMY_DATABASE_URL = os.getenv("TEST_DATABASE_URL", DEFAULT_DB_URL)

@pytest_asyncio.fixture(scope="session")
def event_loop():
    import asyncio
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session")
async def db_engine():
    # Remove existing test DB if any and if using default sqlite
    if "sqlite" in SQLALCHEMY_DATABASE_URL and TEST_DB_FILE in SQLALCHEMY_DATABASE_URL and os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
        
    connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
    
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args=connect_args
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    
    await engine.dispose()
    if "sqlite" in SQLALCHEMY_DATABASE_URL and TEST_DB_FILE in SQLALCHEMY_DATABASE_URL and os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=db_engine, class_=AsyncSession)
    
    async with TestingSessionLocal() as session:
        yield session
        # We don't drop tables per function for integration, maybe just truncate?
        # Or let data persist for scenarios?
        # Standard: rollback transaction or drop. 
        # For simplicity and isolation, let's stick to app dependency override which usually requires per-test management 
        # unless we want persistence. 
        # If we use dependency_overrides, we need to ensure the session yields correctly.
        pass

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()
