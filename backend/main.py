import logging
import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

# Add project root and backend dir to sys.path to support execution from any directory
_root = str(Path(__file__).resolve().parent.parent)
_backend = str(Path(__file__).resolve().parent)
if _root not in sys.path:
    sys.path.insert(0, _root)
if _backend not in sys.path:
    sys.path.insert(0, _backend)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from backend.config import get_settings
from backend.db.connection import engine
from backend.routers import (
    alerts_router,
    gemini_router,
    health_router,
    infrastructure_router,
    insurance_router,
    storm_router,
    surge_router,
)
from backend.utils.http_client import close_http_client, get_http_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cycloneguard.main")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Manages application startup and graceful shutdown routines.
    Initializes HTTP connection pool and validates PostgreSQL/PostGIS connectivity.
    """
    logger.info("Initializing CycloneGuard Enterprise Backend (Dual-Engine: Fani 2019 Ground Truth & Live Feed)...")
    # 1. Warm-up HTTP client
    get_http_client()

    # 2. Verify database connection
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1;"))
            logger.info("Connected to PostGIS database successfully.")
    except Exception as exc:
        logger.error("Database pre-flight check failed: %s", exc)

    yield

    logger.info("Shutting down CycloneGuard Backend...")
    # 3. Clean up HTTP connections
    await close_http_client()

    # 4. Dispose DB connection pool
    await engine.dispose()
    logger.info("Database connection pool closed.")


app = FastAPI(
    title="CycloneGuard Intelligence & Early Warning API",
    description="Dual-Engine Geospatial & AI-Driven Cyclone Early Warning, Storm Surge Inundation, and Parametric Disaster Insurance Platform for the Bay of Bengal.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
api_v1_routers = [
    health_router,
    storm_router,
    surge_router,
    infrastructure_router,
    gemini_router,
    alerts_router,
    insurance_router,
]

for r in api_v1_routers:
    app.include_router(r, prefix="/api/v1")


@app.get("/", summary="Root API Health & Metadata")
async def root_status() -> dict[str, str]:
    return {
        "service": "CycloneGuard Geospatial & Disaster Intelligence API",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "mode_a_case_study": "Cyclone Fani May 2019 Verified Historical Ground Truth",
        "mode_b_operational": "Live Open-Meteo & OpenStreetMap Ingestion",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
