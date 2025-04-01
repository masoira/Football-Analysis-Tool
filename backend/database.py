from collections.abc import AsyncGenerator
import os
import ssl
import logging

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel

logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
ssl_context = ssl.create_default_context()

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"ssl": ssl_context},
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    logger.info("Running init_db")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    logger.info("init_db complete")


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    logger.info("Opening async database session")
    async with async_session() as session:
        yield session
    logger.info("Database session closed")
