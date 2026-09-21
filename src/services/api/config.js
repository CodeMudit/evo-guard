export const API_CONFIG = {
  // Use environment variables for API URL, defaulting to local for development
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  
  // Modes: "connected" (real API), "demo" (simulated data), "offline" (local persistence)
  MODE: import.meta.env.VITE_ECOGUARD_MODE || "demo",
  
  // Feature flags
  FEATURES: {
    MODEL_RISK_ENABLED: import.meta.env.VITE_FEATURE_MODEL_RISK === "true",
    MODEL_VISION_ENABLED: import.meta.env.VITE_FEATURE_MODEL_VISION === "true",
    SATELLITE_ENABLED: import.meta.env.VITE_FEATURE_SATELLITE === "true",
    SENSOR_ENABLED: import.meta.env.VITE_FEATURE_SENSOR === "true",
    LIVE_WEATHER_ENABLED: import.meta.env.VITE_FEATURE_WEATHER === "true",
  }
};
