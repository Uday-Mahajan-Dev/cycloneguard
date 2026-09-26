-- ============================================
-- CycloneGuard PostGIS Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Storms table
CREATE TABLE IF NOT EXISTS storms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    basin VARCHAR(20) NOT NULL,
    category VARCHAR(30),
    status VARCHAR(20) DEFAULT 'active',
    current_lat DOUBLE PRECISION,
    current_lon DOUBLE PRECISION,
    max_wind_kmh DOUBLE PRECISION,
    central_pressure_hpa DOUBLE PRECISION,
    predicted_landfall_lat DOUBLE PRECISION,
    predicted_landfall_lon DOUBLE PRECISION,
    predicted_landfall_time TIMESTAMPTZ,
    track_geojson JSONB,
    cone_of_uncertainty GEOMETRY(POLYGON, 4326),
    source VARCHAR(50),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surge Simulations table
CREATE TABLE IF NOT EXISTS surge_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storm_id UUID REFERENCES storms(id) ON DELETE CASCADE,
    surge_height_m DOUBLE PRECISION NOT NULL,
    flood_polygon GEOMETRY(MULTIPOLYGON, 4326),
    flood_area_km2 DOUBLE PRECISION,
    rainfall_mm_72h DOUBLE PRECISION,
    dem_source VARCHAR(50),
    model_used VARCHAR(50),
    confidence DOUBLE PRECISION,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure table
CREATE TABLE IF NOT EXISTS infrastructure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    osm_id BIGINT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subtype VARCHAR(100),
    capacity INTEGER,
    geom GEOMETRY(GEOMETRY, 4326) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    elevation_m DOUBLE PRECISION,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Exposure Results table
CREATE TABLE IF NOT EXISTS exposure_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storm_id UUID REFERENCES storms(id) ON DELETE CASCADE,
    simulation_id UUID REFERENCES surge_simulations(id) ON DELETE CASCADE,
    infrastructure_id UUID REFERENCES infrastructure(id) ON DELETE CASCADE,
    flood_depth_m DOUBLE PRECISION,
    risk_level VARCHAR(20),
    is_accessible BOOLEAN DEFAULT TRUE,
    recommended_action TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storm_id UUID REFERENCES storms(id) ON DELETE SET NULL,
    alert_type VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    cap_xml TEXT,
    message_en TEXT NOT NULL,
    message_local TEXT,
    target_audience VARCHAR(50),
    dispatch_channel VARCHAR(20),
    dispatch_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Spatial Indexes (GIST)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_storms_cone ON storms USING GIST(cone_of_uncertainty);
CREATE INDEX IF NOT EXISTS idx_surge_polygon ON surge_simulations USING GIST(flood_polygon);
CREATE INDEX IF NOT EXISTS idx_infra_geom ON infrastructure USING GIST(geom);

-- ============================================
-- Regular Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_storms_status ON storms(status);
CREATE INDEX IF NOT EXISTS idx_infra_type ON infrastructure(type);
CREATE INDEX IF NOT EXISTS idx_infra_district ON infrastructure(district);
CREATE INDEX IF NOT EXISTS idx_exposure_storm ON exposure_results(storm_id);
CREATE INDEX IF NOT EXISTS idx_alerts_storm ON alerts(storm_id);

-- Verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;