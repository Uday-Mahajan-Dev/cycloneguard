# 🌀 CycloneGuard AI — Project Master Handoff & Continuation Prompt

> **Project Name:** CycloneGuard AI (Disaster Command & Coastal Infrastructure Intelligence Platform)  
> **Repository Root:** `c:\Users\udayk\cycloneguard`  
> **Status:** Fully Functional Enterprise GIS Disaster Command Center with 3D Map, Gemini 2.5 AI Reasoning, Parametric Hydrodynamic Models, and Real-Time Buoy Marine Streams.

---

## 📌 Executive Summary & Handoff Prompt

You are taking over the **CycloneGuard AI** codebase — an enterprise-grade coastal disaster risk intelligence, hydrodynamic storm surge simulation, and critical infrastructure management platform designed for the Bay of Bengal coastline (Puri / Odisha corridor).

### How to Initialize / Continue Work:
When starting a session on this project, ensure you understand both operational modes:
1. **Command / Demo Scenario Mode (SYS-91B / Cyclone Fani):**
   - Renders 3D terrain mesh (AWS Terrarium DEM), 3D extruded building footprints, uncertainty forecast cone (IMD red swath with crisp white outline), continuous Catmull-Rom spline trajectory line piercing through all 8 IMD cyclone stage spiral badges (1st May -> 5th May), past observed solid track vs dashed projected forecast track, inner contrasting crimson spine thread, concentric 50km–200km range rings, highlighted live active storm eye beacon with multi-layer radar shockwaves and tactical HUD card, hydrodynamic flood inundation mesh (3.5m surge crest), critical infrastructure markers (Substations, Hospitals, Shelters, Telecom), and Gemini AI cascade risk assessments.
2. **Live Marine Mode (Real-Time Ocean Buoy Stream):**
   - Unconditionally unmounts and hides all demo simulation layers, spiral rings, cones, flood polygons, and demo markers.
   - Activates live NASA GIBS TrueColor Satellite Clouds (`MODIS_Terra_CorrectedReflectance_TrueColor`) and RainViewer live radar feeds.
   - Streams live maritime ocean telemetry (significant wave height, peak swell period, ocean current velocity/direction, barometric pressure drop rate) with `"NO ACTIVE CYCLOGENESIS"` status.

---

## 🏗️ System Architecture & Technology Stack

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │               CycloneGuard Web Dashboard                │
                                  │      (Next.js 15, MapLibre GL JS 3D, Zustand, Tailwind) │
                                  └────────────┬──────────────────────────────┬──────────────┘
                                               │                              │
                                     REST API Calls (FastAPI)       Direct Tile WebGL Streaming
                                               │                              │
                                               ▼                              ▼
                 ┌──────────────────────────────────────────────┐    ┌───────────────────────────────────┐
                 │          FastAPI Backend Service             │    │       External Tile Services      │
                 │              (Port 8001)                     │    │                                   │
                 ├──────────────────────────────────────────────┤    │ • ESRI World Imagery Satellite    │
                 │ • /api/storms (JTWC & Fani Ground Truth)     │    │ • AWS Terrarium 3D DEM Terrain    │
                 │ • /api/surge (Delft3D/SLOSH Hydrodynamic)    │    │ • NASA GIBS TrueColor Clouds      │
                 │ • /api/infrastructure (PostGIS Spatial)      │    │ • RainViewer Live Doppler Radar   │
                 │ • /api/gemini (Gemini 2.5 Flash Multimodal)  │    │ • Open-Meteo Marine Buoy API      │
                 │ • /api/insurance (Parametric Payout Triggers)│    └───────────────────────────────────┘
                 │ • /api/alerts (Twilio SMS/Voice Broadcast)   │
                 └──────────────┬───────────────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────────────────────┐
                 │       Supabase PostgreSQL + PostGIS DB       │
                 │ (Spatial queries, DEM data, Exposure caches) │
                 └──────────────────────────────────────────────┘
```

### Frontend Stack (`/frontend`):
- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Map & 3D Visualization:** MapLibre GL JS (v5+), WebGL2 raster/vector rendering, AWS Terrarium DEM terrain exaggeration (`3.0x`), 3D building extrusions, procedural canvas texture generator for infrared cyclone spirals.
- **State Management:** Zustand (`useStormStore.ts`, `useMapStore.ts`)
- **UI & Icons:** TailwindCSS, Lucide Icons, Glassmorphism design system.
- **Weather & Radar:** Custom hook `useRainViewerTiles.ts` with 10-minute auto-refresh, NASA GIBS TrueColor WMTS tiles.

### Backend Stack (`/backend`):
- **Framework:** FastAPI (Python 3.11, Uvicorn on Port 8001)
- **Database & Spatial Engine:** PostgreSQL + PostGIS (via Supabase), GeoAlchemy2, Shapely, PyProj.
- **AI Intelligence:** Google Gemini 2.5 Flash / 1.5 Pro via Google Generative AI SDK (`gemini-2.5-flash`).
- **Hydrodynamic Engine:** Parametric Jelesnianski & Delft3D-approximated surge formula based on central pressure drop ($\Delta P$), maximum sustained winds ($V_{max}$), radius of maximum winds ($R_{max}$), bathymetric slope, and tidal phase.
- **Alert Dispatch:** Twilio REST API integration for emergency SMS and voice dispatch.
- **Earth Observation:** Google Earth Engine (GEE) integration for Sentinel-1 SAR flood extent extraction.

---

## 📂 Project Directory Structure

```
c:\Users\udayk\cycloneguard\
├── PROJECT_HANDOFF.md                  <-- This file
├── backend/
│   ├── main.py                         # FastAPI entrypoint, CORS configuration, router mounting
│   ├── config.py                       # Pydantic Settings (API keys, DB URLs, Twilio, Gemini)
│   ├── requirements.txt                # Python dependencies
│   ├── db/
│   │   ├── database.py                 # SQLAlchemy async/sync engine session setup
│   │   └── base.py                     # Declarative base
│   ├── models/                         # SQLAlchemy ORM models (Storm, Infrastructure, Simulation, etc.)
│   ├── routers/
│   │   ├── storm.py                    # Storm track ingest & Fani case study loader
│   │   ├── surge.py                    # Hydrodynamic surge calculation & flood polygon endpoint
│   │   ├── infrastructure.py           # PostGIS queries & asset exposure calculation
│   │   ├── gemini.py                   # Gemini 2.5 Flash multimodal disaster impact agent
│   │   ├── insurance.py                # Parametric trigger evaluator
│   │   ├── alerts.py                   # Emergency public notification dispatcher
│   │   └── health.py                   # Health check endpoint
│   ├── services/
│   │   ├── gemini_agent.py             # Prompt engineering & structured JSON parsing for Gemini Flash
│   │   ├── surge_model.py              # Hydrodynamic physics engine
│   │   ├── infrastructure_query.py     # Spatial buffer & intersection queries
│   │   ├── osm_loader.py               # OpenStreetMap Overpass API Puri ground truth loader
│   │   ├── marine_fetcher.py           # Open-Meteo marine buoy telemetry ingestion
│   │   ├── storm_fetcher.py            # JTWC / IMD real-time cyclone track scraper
│   │   └── alert_dispatcher.py         # Twilio SMS / Voice broadcast client
│   └── workers/
└── frontend/
    ├── app/
    │   ├── layout.tsx                  # Root layout with fonts, auth context, theme provider
    │   ├── page.tsx                    # Landing / Overview page
    │   ├── globals.css                 # Global CSS tokens & custom animations
    │   ├── dashboard/
    │   │   └── page.tsx                # Master Command Center Page (Split HUD + 3D Map)
    │   ├── field/                      # Field responder mobile view
    │   ├── insurance/                  # Parametric insurance stakeholder view
    │   └── login/                      # Authentication screen
    ├── components/
    │   ├── dashboard/
    │   │   ├── TopHUDBar.tsx           # Top navigation, mode toggles, AI triggers, status badges
    │   │   ├── LeftTelemetryPanel.tsx  # Storm physics controls, simulation run sliders, buoy readings
    │   │   ├── GridMonitorPanel.tsx    # Critical infrastructure grid status & exposure monitor
    │   │   ├── RightIntelligencePanel.tsx # Gemini bulletin (EN/Odia), cascade risk matrix, actions
    │   │   └── LiveTerminalFeed.tsx    # Live streaming dispatch terminal logs
    │   ├── map/
    │   │   ├── MapContainer.tsx        # Master MapLibre GL 3D Map component (Terrain, Layers, Markers)
    │   │   ├── LiveRadarPlayback.tsx   # 5-frame radar loop playback scrubber HUD
    │   │   └── puriBuildings.ts        # 3D building footprint GeoJSON generator
    │   └── ui/                         # Reusable UI primitives (AlertModal, Buttons, Cards)
    ├── hooks/
    │   ├── useRainViewerTiles.ts       # RainViewer API timestamp fetcher & auto-refresh hook
    │   ├── useRealtimeTelemetry.ts     # Open-Meteo buoy 10s polling telemetry hook
    │   └── useAuth.ts                  # User role authentication hook
    ├── lib/
    │   ├── api.ts                      # Axios backend API client with guaranteed fallback mock datasets
    │   ├── types.ts                    # TypeScript interface definitions (Storm, Simulation, Infra, etc.)
    │   ├── stormGeometry.ts            # GeoJSON generators (Uncertainty cone, trajectory, flood polygon)
    │   ├── demoTrack.ts                # Cyclone Fani demo track geometry, range rings, and cone swath
    │   └── stores/
    │       ├── useStormStore.ts        # Master Zustand store for storm, simulation, marine mode state
    │       └── useMapStore.ts          # Map camera, layer visibility store
    └── package.json
```

---

## ⚙️ Environment Variables & Configuration

### Backend `.env` (`/backend/.env`):
```ini
ENVIRONMENT=development
PORT=8001

# Supabase PostgreSQL + PostGIS
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Google Gemini API
GEMINI_API_KEY=AIzaSy...

# Twilio Emergency Alert Dispatcher (Optional for SMS/Voice)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_PHONE=+1...
TWILIO_ALERT_TO_PHONE=+91...

# Google Earth Engine (Optional for Live SAR processing)
GEE_SERVICE_ACCOUNT=...
GEE_PRIVATE_KEY=...
```

### Frontend `.env.local` (`/frontend/.env.local`):
```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
NEXT_PUBLIC_MAPLIBRE_STYLE=https://demotiles.maplibre.org/style.json
```

---

## 🚀 Running the Platform Locally

### 1. Start the Backend:
```bash
cd c:\Users\udayk\cycloneguard\backend
# Activate virtual environment if configured:
.\.venv\Scripts\activate
# Run Uvicorn server:
uvicorn main:app --reload --port 8001
```
*Backend Swagger Docs accessible at: `http://localhost:8001/docs`*

### 2. Start the Frontend:
```bash
cd c:\Users\udayk\cycloneguard\frontend
npm run dev
```
*Frontend Application accessible at: `http://localhost:3000/dashboard`*

---

## 🗺️ Detailed 3D Map Implementation Guide (`MapContainer.tsx`)

The map component is the core visual engine of CycloneGuard. Key technical highlights:

1. **Camera Focus Coordinates:**
   - Active Threat Zone (Bay of Bengal / Puri Sector): `[86.2, 19.3]`
   - Zoom: `6.8`, Pitch: `50°`, Bearing: `-25°`
2. **Layers & Layer IDs:**
   - `nasa-gibs-clouds-layer`: NASA GIBS satellite clouds (`MODIS_Terra_CorrectedReflectance_TrueColor`)
   - `rainviewer-radar-layer`: Doppler radar raster tiles using timestamp from `useRainViewerTiles`
   - `demo-track-swath`: Semi-transparent purple/violet probability swath (`#7850ff`, opacity 0.18)
   - `demo-track-past`: Solid magenta past trajectory line (`#ff2d7a`, width 4.5px)
   - `demo-track-forecast`: Dashed magenta projected forecast line (`#ff2d7a`, width 4.5px, dasharray `[2.5, 1.8]`)
   - `demo-track-eye`: Bright red/pink eye center core dot (`#ff1e56`)
   - `demo-track-landfall`: Amber predicted landfall point (`#f59e0b`)
   - `demo-range-ring-50`, `100`, `150`, `200`: Concentric metric distance range rings (dashed white, 50–200 km)
   - `flood-inundation-fill` & `flood-extrusion-3d`: Deep ocean blue hydrodynamic inundation polygon with 3D elevation height
   - `3d-buildings-extrusion`: 3D building extrusions colored by facility type (Hospital = Orange, Substation = Red, Shelter = Emerald)
   - `infra-halo-layer` & `infra-points-layer`: Critical infrastructure risk pins
3. **HTML DOM Markers:**
   - **Cyclone Eye:** Animated CSS `@keyframes spin` rotating SVG icon with radar ping halo and wind velocity badge.
   - **Predicted Landfall:** Amber badge marker at Puri Coast `[85.83, 19.80]`.
   - **Infrastructure Assets:** Interactive markers with click-to-select and fly-to inspection camera animation.
4. **Marine Mode Gate:**
   - Controlled by `isMarineMode` prop / Zustand store.
   - When `isMarineMode === true`: All storm layers, Fani trajectory, range rings, and HTML markers are completely unmounted/hidden (`visibility: 'none'`), leaving a clean satellite basemap with live marine weather and telemetry HUD.
   - When `isMarineMode === false`: All storm layers, trajectory lines, cone swath, range rings, flood polygons, pins, and markers are instantly restored.

---

## 🧠 AI & Hydrodynamic Models Guide

### 1. Gemini 2.5 Flash Disaster Impact Agent (`services/gemini_agent.py`):
- Receives storm telemetry, surge depth, and exposed infrastructure coordinates.
- Produces a structured JSON output with:
  - `executive_summary`: High-level tactical disaster overview.
  - `bulletin_en`: Official English emergency broadcast bulletin.
  - `bulletin_local`: Official Odia script ($\text{ଓଡ଼ିଆ}$) emergency warning broadcast.
  - `cascade_risks`: Sequential infrastructure failure cascade analysis.
  - `grid_shutdown_schedule`: Controlled power substation de-energization schedule to prevent electrocution/explosion.
  - `evacuation_priorities`: Priority zones with road wash-away hazards.
  - `parametric_trigger_eligible`: Boolean flag for insurance payout liquidity release.

### 2. Hydrodynamic Parametric Surge Engine (`frontend/lib/stormGeometry.ts` & `backend/services/surge_model.py`):
- **Interactive Simulation Parameters:**
  - `simWind` (Max Sustained Wind): Controlled slider with range 80–260 km/h, step 1 (Default: 186 km/h).
  - `simPressure` (Central Barometric Pressure): Controlled slider with range 900–1000 hPa, step 1 (Default: 937 hPa).
  - Live slider updates provide instantaneous live number previews without triggering heavy GIS recomputations while dragging.
- **Parametric Surge Model:**
  $$\text{surgeHeightM} = \text{clamp}(0.5 + (\text{maxWind} - 90) \times 0.016 + (1010 - \text{pressure}) \times 0.021, 0.5, 6.0)$$
  $$\text{inundationAreaKm2} = \text{round}(200 + \text{surgeHeightM} \times 420 + (\text{maxWind} - 120) \times 3)$$
- **Calibrated IMD Benchmark Targets:**
  - Wind 120 km/h / Pressure 990 hPa $\rightarrow \sim 1.4\text{m}$ surge, ~788 km² inundation (Moderate risk, coastal substations safe)
  - Wind 165 km/h / Pressure 960 hPa $\rightarrow \sim 2.75\text{m}$ surge, ~1485 km² inundation (Multiple high-risk assets)
  - Wind 186 km/h / Pressure 937 hPa $\rightarrow \sim 3.5\text{m}$ surge, ~1746 km² inundation (Critical trips on Puri Town & Marine Drive)
  - Wind 210 km/h / Pressure 932 hPa $\rightarrow \sim 4.0\text{m}$ surge, ~2150 km² inundation (Extreme catastrophic inundation)
- **Multi-Tier 3D Inundation Color Rendering on MapLibre:**
  - $< 1.5\text{m}$: Electric Blue (`#0284c7`)
  - $1.5\text{m} - 2.5\text{m}$: Royal Violet (`#7c3aed`)
  - $> 2.5\text{m}$: Deep Magenta / Crimson Alert (`#e11d48`)
- **Automated Electrical Substation Tripping Protocol:**
  - $\text{Depth} > 1.0\text{m} \rightarrow$ `⚡ ISOLATED (TRIPPED)` (Immediate shutdown at T-2h)
  - $\text{Depth} > 0.3\text{m} \rightarrow$ `⚠️ AT RISK` (Standby feeder cutoff at T-4h)
  - $\text{Depth} \le 0.3\text{m} \rightarrow$ `🟢 LIVE (ARMED)` (Normal operation at T-6h)
- **Gemini 2.5 Flash Emergency Public Bulletin Dynamic Synthesis:**
  - Dynamically synthesizes English and Odia ($\text{ଓଡ଼ିଆ}$) emergency evacuation orders, cascade infrastructure risk schedules, and danger levels based on latest simulated surge depth and tripped assets.

---

## 📋 Key API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck & system status |
| `POST` | `/api/storms/fani-case-study` | Load Cyclone Fani ground-truth benchmark scenario |
| `GET` | `/api/storms/active` | Get currently monitored cyclone data |
| `POST` | `/api/surge/simulate` | Execute hydrodynamic surge calculation |
| `GET` | `/api/infrastructure/list` | List infrastructure assets by district/type |
| `GET` | `/api/infrastructure/exposed/{sim_id}` | Query assets impacted by surge polygon |
| `POST` | `/api/gemini/analyze` | Trigger Gemini 2.5 Flash multimodal disaster analysis |
| `POST` | `/api/insurance/evaluate` | Evaluate parametric payout triggers |
| `POST` | `/api/alerts/broadcast` | Dispatch emergency alerts via Twilio SMS |

---

## 🛠️ Recommended Next Steps / Backlog

1. **Live IMD / JTWC Auto-Feed:** Connect `services/storm_fetcher.py` to live automated cron schedule for real-time North Indian Ocean cyclone advisory scraping.
2. **Sentinel-1 SAR Inundation Ingestion:** Enable live Google Earth Engine Sentinel-1 SAR backscatter thresholding to overlay actual satellite observed flood vectors during active landfalls.
3. **WebRTC Drone / CCTV Feed Widget:** Integrate live RTSP/WebRTC coastal camera streams into the floating HUD panels.
4. **Offline PWA Caching:** Expand service worker caching for field responders in low-connectivity coastal zones.

---

*Handoff artifact generated successfully for CycloneGuard AI. Ready for immediate continuation.*
