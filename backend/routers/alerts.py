import uuid
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.connection import get_db
from backend.db.models import Alert
from backend.services.alert_dispatcher import dispatch_alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])


class AlertDispatchRequest(BaseModel):
    storm_id: UUID | None = None
    alert_type: str = "CYCLONE_EMERGENCY"
    severity: str = "CRITICAL"
    message_en: str
    message_local: str | None = None
    target_audience: str = "PUBLIC_AND_EMERGENCY_SERVICES"
    dispatch_channel: str = "TELEGRAM"


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: UUID
    storm_id: UUID | None
    alert_type: str
    severity: str
    message_en: str
    message_local: str | None
    target_audience: str
    dispatch_channel: str
    dispatch_status: str
    created_at: datetime


@router.post("/dispatch", summary="Create and dispatch emergency disaster alert")
async def create_and_dispatch_alert(
    req: AlertDispatchRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Persists alert into the database and dispatches emergency broadcast
    to Telegram channels or active console monitors.
    """
    alert_id = uuid.uuid4()
    now_utc = datetime.now(timezone.utc)

    delivery_result = await dispatch_alert(
        message=req.message_en,
        severity=req.severity,
    )
    dispatch_status = delivery_result.get("status", "delivered")

    db_alert = Alert(
        id=alert_id,
        storm_id=req.storm_id,
        alert_type=req.alert_type,
        severity=req.severity,
        message_en=req.message_en,
        message_local=req.message_local,
        target_audience=req.target_audience,
        dispatch_channel=req.dispatch_channel,
        dispatch_status=dispatch_status,
        created_at=now_utc,
    )
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)

    return {
        "alert": AlertResponse.model_validate(db_alert),
        "delivery": delivery_result,
    }


@router.get("", response_model=list[AlertResponse], summary="List recent emergency alerts")
async def list_alerts(
    db: AsyncSession = Depends(get_db),
) -> list[AlertResponse]:
    """Returns chronologically ordered history of broadcast alerts."""
    stmt = select(Alert).order_by(Alert.created_at.desc()).limit(50)
    res = await db.execute(stmt)
    alerts = res.scalars().all()
    return [AlertResponse.model_validate(a) for a in alerts]
