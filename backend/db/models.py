import uuid
from datetime import datetime
from typing import Any

from geoalchemy2 import Geometry
from sqlalchemy import BigInteger, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Storm(Base):
    __tablename__ = "storms"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    basin: Mapped[str] = mapped_column(String(20), default="BOB", nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    current_lat: Mapped[float] = mapped_column(Float, nullable=False)
    current_lon: Mapped[float] = mapped_column(Float, nullable=False)
    max_wind_kmh: Mapped[float | None] = mapped_column(Float, nullable=True)
    central_pressure_hpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    predicted_landfall_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    predicted_landfall_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    predicted_landfall_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    track_geojson: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    cone_of_uncertainty: Mapped[Any | None] = mapped_column(Geometry("POLYGON", srid=4326), nullable=True)
    source: Mapped[str] = mapped_column(String(50), default="NOAA_IBTrACS", nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    simulations = relationship("SurgeSimulation", back_populates="storm", cascade="all, delete-orphan")
    exposure_results = relationship("ExposureResult", back_populates="storm", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="storm")


class SurgeSimulation(Base):
    __tablename__ = "surge_simulations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    storm_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("storms.id", ondelete="CASCADE"),
        nullable=False,
    )
    surge_height_m: Mapped[float] = mapped_column(Float, nullable=False)
    flood_polygon: Mapped[Any | None] = mapped_column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    flood_area_km2: Mapped[float | None] = mapped_column(Float, nullable=True)
    rainfall_mm_72h: Mapped[float | None] = mapped_column(Float, nullable=True)
    dem_source: Mapped[str] = mapped_column(String(50), default="NASADEM_30m", nullable=False)
    model_used: Mapped[str] = mapped_column(String(50), default="Holland_SLOSH_Parametric", nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    storm = relationship("Storm", back_populates="simulations")
    exposure_results = relationship("ExposureResult", back_populates="simulation", cascade="all, delete-orphan")


class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    osm_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    subtype: Mapped[str | None] = mapped_column(String(100), nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    geom: Mapped[Any] = mapped_column(Geometry("GEOMETRY", srid=4326), nullable=False)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    elevation_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    exposure_results = relationship("ExposureResult", back_populates="infrastructure", cascade="all, delete-orphan")


class ExposureResult(Base):
    __tablename__ = "exposure_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    storm_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("storms.id", ondelete="CASCADE"),
        nullable=False,
    )
    simulation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("surge_simulations.id", ondelete="CASCADE"),
        nullable=False,
    )
    infrastructure_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("infrastructure.id", ondelete="CASCADE"),
        nullable=False,
    )
    flood_depth_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    recommended_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    storm = relationship("Storm", back_populates="exposure_results")
    simulation = relationship("SurgeSimulation", back_populates="exposure_results")
    infrastructure = relationship("Infrastructure", back_populates="exposure_results")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    storm_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("storms.id", ondelete="SET NULL"),
        nullable=True,
    )
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    cap_xml: Mapped[str | None] = mapped_column(Text, nullable=True)
    message_en: Mapped[str] = mapped_column(Text, nullable=False)
    message_local: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_audience: Mapped[str] = mapped_column(String(50), nullable=False)
    dispatch_channel: Mapped[str] = mapped_column(String(20), nullable=False)
    dispatch_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    storm = relationship("Storm", back_populates="alerts")
