from collections.abc import AsyncGenerator
import os
import ssl

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
ssl_context = ssl.create_default_context()

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"ssl": ssl_context},
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
