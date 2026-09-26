from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db

router = APIRouter(prefix="/health", tags=["Health"])

REQUIRED_TABLES = [
    "storms",
    "surge_simulations",
    "infrastructure",
    "exposure_results",
    "alerts",
]


@router.get("", summary="System health, PostGIS, and database table verification")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """
    Validates database connectivity, PostGIS spatial extension availability,
    and the presence of all core disaster management tables.
    """
    try:
        # 1. Database connection ping
        await db.execute(text("SELECT 1;"))

        # 2. PostGIS version check
        postgis_ver_res = await db.execute(text("SELECT PostGIS_Version();"))
        postgis_version = postgis_ver_res.scalar_one_or_none()

        # 3. Check existing tables in public schema
        tables_res = await db.execute(
            text(
                """
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
                """
            )
        )
        existing_tables = [row[0] for row in tables_res.fetchall()]
        missing_tables = [t for t in REQUIRED_TABLES if t not in existing_tables]

        return {
            "status": "healthy" if not missing_tables else "degraded",
            "database": "connected",
            "postgis_version": postgis_version or "PostGIS Enabled",
            "schema_verification": {
                "required_tables": REQUIRED_TABLES,
                "existing_tables": existing_tables,
                "missing_tables": missing_tables,
                "all_tables_present": len(missing_tables) == 0,
            },
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Health check failed: {str(exc)}",
        ) from exc
