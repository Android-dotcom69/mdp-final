from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings
import ssl as ssl_module

# Render provides DATABASE_URL as postgresql:// but SQLAlchemy async needs postgresql+asyncpg://
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Strip sslmode and channel_binding from URL (asyncpg doesn't support them as query params)
# Use ssl=True via connect_args instead
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
parsed = urlparse(db_url)
query_params = parse_qs(parsed.query)
needs_ssl = query_params.pop("sslmode", [None])[0] in ("require", "verify-full", "verify-ca")
query_params.pop("channel_binding", None)
clean_query = urlencode({k: v[0] for k, v in query_params.items()})
db_url = urlunparse(parsed._replace(query=clean_query))

# Create engine with SSL if needed
connect_args = {}
if needs_ssl:
    ssl_ctx = ssl_module.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl_module.CERT_NONE
    connect_args["ssl"] = ssl_ctx

engine = create_async_engine(db_url, echo=True, connect_args=connect_args)

# SessionLocal class
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
