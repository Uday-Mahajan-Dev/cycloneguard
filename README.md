<div align="center">

# 🌀 CycloneGuard
### *Anticipate. Protect. Respond — 72 Hours Before Landfall*

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostGIS](https://img.shields.io/badge/Database-PostgreSQL_%2B_PostGIS-336791?style=for-the-badge&logo=postgresql)](https://postgis.net/)
[![Gemini AI](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**An Autonomous 3D Geospatial Command Engine & Anticipatory Grid Defense Platform for Coastal Communities.**

[🌐 Live Command Center](https://cycloneguard.vercel.app) • [📡 Live Backend API](https://cycloneguard-api.onrender.com/docs) • [🏥 Health Diagnostics](https://cycloneguard-api.onrender.com/api/v1/health)

</div>

---

## 📌 Submission Overview

* **Hackathon:** Build with AI: Code for Communities — Second Edition
* **Team Name:** CycloneGuard Devs
* **Team Members:** **Uday Mahajan** & **Pradnya Chaudhari**
* **Repository:** [github.com/Uday-Mahajan-Dev/cycloneguard](https://github.com/Uday-Mahajan-Dev/cycloneguard)
* **Production Deployment:** [cycloneguard.vercel.app](https://cycloneguard.vercel.app)
* **Operational Cost:** **$0.00 / month** (100% Free-Tier Serverless Architecture)

---

## 🌊 The Problem vs. The CycloneGuard Solution

### The Reality Today: Reactive & Late
During severe tropical cyclones in the Bay of Bengal and Arabian Sea, **infrastructure failures cascade hours before landfall**:
* **Access Isolation:** Critical hospital feeder bridges and roads flood 6–8 hours *before* landfall, trapping ICU logistics.
* **Grid Drowning:** Unplanned 33kV substation submersion triggers explosive short circuits and statewide blackouts.
* **Relief Delays:** Traditional disaster insurance and relief funds take 45+ days post-landfall to process claims.

### The Solution: Anticipatory Intelligence 72h Ahead
**CycloneGuard** transforms disaster management from reactive post-storm relief into **pre-emptive, automated defense**:
1. **Hydrodynamic Physics:** Models 3D storm surge inundation on NASADEM 30m elevation maps.
2. **PostGIS Spatial Intersections:** Intersects flood polygons with critical assets (hospitals, substations, shelters).
3. **Grounded Gemini AI Reasoning:** Synthesizes spatial matrices into executable grid-tripping schedules, evacuation priorities, and multilingual CAP bulletins.
4. **Parametric Finance:** Automatically authorizes financial relief payouts *before* landfall when physics thresholds are breached.

---

## 🌟 19 Core System Capabilities

### 🛰️ 3D Geospatial & Marine Command
1. **3D MapLibre & Deck.gl Interactive Globe:** High-pitch, 60fps 3D terrain globe centered on Bay of Bengal.
2. **Cyclone Track Trajectory & Range Rings:** Fani-style approach vector, storm eye marker, and 50km–200km range rings.
3. **3D Hydrodynamic Surge Polygons:** NASADEM 30m elevation-masked inundation vectors with depth gradient shading.
4. **Dual View Mode Switch:** Toggle between **Command Center Mode** and **Live Marine Telemetry Mode**.
5. **Live Weather & Cloud Layers:** Real-time cloud reflectivity and precipitation radar tiles.
6. **Landfall Countdown & Severity Banner:** Live countdown timer with color-coded threat banner (`CRITICAL / IMMINENT`).
7. **Physical Telemetry Gauges:** Real-time dials for sustained wind, pressure drop, wave crest height, and ocean currents.

### 🏗️ Spatial Engine & Physics Simulation
8. **Interactive Infrastructure Risk Pins:** Spatial pins for 33kV substations, hospitals, shelters, and bridges.
9. **Parametric Surge Re-Simulation Sliders:** Live wind speed (80–260 km/h) & central pressure (900–1000 hPa) sliders.
10. **PostGIS Spatial Exposure Query Engine:** Raw SQL `ST_Intersects` spatial overlap engine with depth calculations.
11. **Statewide Grid Tripping Protocol Manager:** Automated status tracker (`LIVE` vs. `ISOLATED / TRIPPED`) for substations.

### 🤖 Grounded Gemini AI Reasoning
12. **Gemini 2.5 Flash Reasoning Engine:** Zero-hallucination multimodal agent using strict Pydantic JSON function calling.
13. **Multilingual Emergency Bulletin Generator:** Automated emergency public bulletins generated in **English & Odia**.

### 📢 Response, Finance & DevOps
14. **Common Alerting Protocol (CAP 1.2) Engine:** OASIS-compliant CAP XML alert message generator.
15. **Multi-Channel Alert Dispatcher:** Instant dispatch via **Telegram Bot API** and live console feeds.
16. **Live System Telemetry Terminal:** Real-time streaming console tracking DEM extrusions, grid trips, and buoy logs.
17. **Parametric Insurance Evaluator:** Pre-landfall payout authorization engine when wind/surge thresholds are breached.
18. **Responsive Field View:** Mobile & tablet responsive HUD with dismissible controls and touch-optimized sliders.
19. **Production Health Diagnostics:** Public `/api/v1/health` verification suite and interactive Swagger OpenAPI docs.

---

## 🏗️ System Architecture


    A[Public Weather Feeds<br/>Open-Meteo / NOAA] -->|Async Polling| B[FastAPI Backend<br/>Render.com]
    C[Google Earth Engine<br/>NASADEM 30m DEM] -->|Surge Polygon Mask| B
    
    B -->|Async SQLAlchemy / asyncpg| D[(Supabase PostgreSQL<br/>+ PostGIS Extension)]
    
    D -->|ST_Intersects Spatial Query| E[Exposed Asset Matrix<br/>Substations / Hospitals / Shelters]
    
    E -->|Structured Prompt + Schema| F[Gemini 2.5 Flash AI<br/>Google AI Studio]
    
    F -->|Structured JSON Protocol| B
    
    B -->|REST API + CORS| G[Next.js 14 Frontend<br/>Vercel]
    B -->|Markdown Alerts| H[Telegram Bot API]
    B -->|OASIS CAP 1.2 XML| I[Command Terminals]
    
    G -->|3D MapLibre / Deck.gl| J[Incident Commander Dashboard]

🛠️ Tech Stack & $0 Free-Tier Deployment
Component	Technology	Free Tier Provider	Operational Cost
Frontend	Next.js 14 (App Router), TypeScript, MapLibre GL JS, Deck.gl, Tailwind CSS, shadcn/ui	Vercel	$0.00
Backend API	FastAPI (Python 3.11), Uvicorn, Async SQLAlchemy 2.0, Pydantic v2, GeoAlchemy2	Render	$0.00
Database	PostgreSQL 15 + PostGIS Spatial Extension	Supabase	$0.00
AI Reasoning	Gemini 2.5 Flash (google-generativeai)	Google AI Studio	$0.00
Earth Data	GEE NASADEM 30m, Open-Meteo API, NOAA IBTrACS	Google Earth Engine	$0.00
Alert Channel	Telegram Bot API, CAP 1.2 XML	Telegram	$0.00
🚀 Local Development Setup
Prerequisites
Node.js: v18.0 or higher
Python: v3.11.x
Git: Active CLI installation
1. Clone Repository
Bash

git clone https://github.com/Uday-Mahajan-Dev/cycloneguard.git
cd cycloneguard
2. Backend Setup
Bash

cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Fill in DATABASE_URL, GOOGLE_AI_API_KEY, GEE credentials in backend/.env

# Run FastAPI development server
uvicorn main:app --reload --port 8000
Backend will start at: http://localhost:8000
Swagger API Docs: http://localhost:8000/docs

3. Frontend Setup
Bash

# Open a new terminal from the root folder
cd frontend

# Install Node dependencies
npm install

# Configure Environment Variables
# Create frontend/.env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run Next.js development server
npm run dev
Frontend will start at: http://localhost:3000

🔗 Key API Endpoints Summary
Method	Endpoint	Description
GET	/api/v1/health	Diagnostic check for PostgreSQL, PostGIS, and DB tables
GET	/api/v1/storms/active	Retrieve current active cyclonic systems
POST	/api/v1/storms/seed-demo	Seed synthetic "Cyclone Dana" approaching Odisha coast
POST	/api/v1/surge/simulate	Execute hydrodynamic surge polygon calculation
GET	/api/v1/infrastructure/exposed/{sim_id}	Run PostGIS ST_Intersects spatial asset query
POST	/api/v1/infrastructure/seed-demo	Seed 10 critical assets (substations, hospitals, shelters)
POST	/api/v1/gemini/analyze	Run Gemini 2.5 Flash cascade risk reasoning engine
POST	/api/v1/alerts/dispatch	Send emergency advisory via Telegram / CAP broadcast
POST	/api/v1/insurance/evaluate/{storm_id}	Evaluate parametric trigger threshold & release payout
👥 Team & Acknowledgments
CycloneGuard was built for Build with AI: Code for Communities — Second Edition.

Uday Mahajan — Lead Architect, Full-Stack & Spatial Engineer (GitHub)
Pradnya Chaudhari — AI Systems & Domain Analyst
Special thanks to Google AI Studio, Supabase, Vercel, and Render for providing robust free-tier infrastructure that makes anticipatory disaster defense accessible to every coastal community.

<div align="center">
🌐 Launch Live Platform • ⭐ Star Repository

CycloneGuard — Protecting Coastal Communities Before the Storm Arrives.

</div> ```
