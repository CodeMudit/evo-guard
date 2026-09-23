# EvoGuard: Early Warning & Landslide Risk Monitoring System
**SIH26001 Prototype for North Eastern Regional Node for Disaster Risk Reduction (NER-DRR)**

## Project Purpose
This platform is a comprehensive, AI-powered early warning and disaster monitoring system developed for the Smart India Hackathon (SIH26001) problem statement by the Ministry of DoNER and NESAC. It is designed to track real-time environmental sensors, model categorical landslide/flood risk using Machine Learning, and provide actionable analytics for State Disaster Response Forces (SDRF) and field officials in the Indian North-Eastern Region (NER).

## Key Features
1. **Real-Time GIS Telemetry**: Integrated `react-leaflet` with `leaflet.heat` for dynamic risk mapping and GeoJSON infrastructure overlays (roads/villages).
2. **Authority Dashboards**: Road Connectivity Matrices, 72h Weather Risk Forecasts, and dynamically sorted Emergency Response Prioritization lists.
3. **PWA Offline Reporting**: `localforage` (IndexedDB) and `browser-image-compression` power an offline-first reporting tool for field officials, allowing them to queue incident media when network connectivity is lost, syncing automatically upon return.
4. **Multilingual & Accessible**: Full English, Hindi, and Assamese translations via `i18next`. Includes a government-grade accessibility toolbar offering dynamic text scaling and High-Contrast mode.
5. **Simulated ML Backend**: Express.js REST API simulating an ensemble Random Forest model, outputting categorical risk (EXTREME, HIGH, MODERATE, LOW) alongside confidence percentages and weighted contributing factors. Includes a mock MSG91 SMS dispatch transport layer.

## Architecture Overview
The application follows a decoupled client-server architecture:
- **Frontend (Client)**: React 19 + Vite SPA. Global state is managed via `AppContext.jsx`. Uses `tailwindcss` for styling with a custom dark/glassmorphic theme mirroring the official `nerdrr.gov.in` aesthetic.
- **Backend (Server)**: Node.js/Express.js backend utilizing `better-sqlite3` for fast, local persistent storage of telemetry logs and alerts.
- **Deployment**: Configured to run concurrently in development mode using `npm run dev`. Fully buildable for production via `npm run build`.

## How to add Real IMD / Sensor / SMS Credentials Later
Currently, the system uses mocked data and simulations for the SIH prototype to guarantee 100% uptime without external dependencies. To deploy to production with real hardware:
1. **Sensors / IMD**: In `backend/server.js`, replace the `setInterval` simulation logic with WebSocket hooks to your AWS IoT Core MQTT broker or direct polling of the IMD API endpoints.
2. **ML Model**: In `backend/routes/risk.js`, replace the `/predict` heuristic logic with an HTTP or gRPC call to your deployed Python (Flask/FastAPI) inference server hosting the actual `.pkl`/`.onnx` model.
3. **SMS Dispatch**: In `backend/routes/alerts.js`, replace the `mockDispatchTransport` function with the actual MSG91 Node.js SDK or REST API call, authenticating via `.env` credentials.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (Frontend + Backend concurrently):
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## License
MIT License. Developed for Smart India Hackathon.