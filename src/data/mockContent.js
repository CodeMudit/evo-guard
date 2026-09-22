// Centralised static / mock content for the government-style UI.
// Replace these with real feeds later. Clearly marked as prototype data.

export const MOCK_VISITOR_STATS = {
  today: 1247,
  weekly: 8932,
  total: 184563,
};

export const MOCK_NEWS = [
  { ts: "2026-09-21 14:32:10", headline: "Heavy rainfall advisory issued for East Khasi Hills", source: "IMD Shillong" },
  { ts: "2026-09-21 11:05:44", headline: "Slope movement detected near NH-6, Jaintia Hills sector", source: "Field Report" },
  { ts: "2026-09-20 18:22:01", headline: "Landslide risk elevated in West Garo Hills after continuous rain", source: "SDRF Meghalaya" },
  { ts: "2026-09-20 09:15:33", headline: "Road blockage cleared on Shillong–Guwahati corridor", source: "PWD Update" },
  { ts: "2026-09-19 16:40:12", headline: "Soil moisture sensors report critical levels in Cherrapunji zone", source: "Telemetry" },
  { ts: "2026-09-19 08:55:00", headline: "District administration issues precautionary advisory for low-lying areas", source: "DDMA" },
  { ts: "2026-09-18 21:10:45", headline: "Satellite imagery confirms fresh slope instability near Mawlynnong", source: "NESAC Analysis" },
  { ts: "2026-09-18 13:28:19", headline: "Emergency response teams placed on standby in three districts", source: "SDRF" },
];

export const MOCK_SOCIAL = [
  { handle: "@SDRF_Meghalaya", time: "2h", text: "Teams on ground assessing slope conditions in East Khasi Hills. Residents advised to avoid travel on affected stretches. #LandslideAlert #NER", tags: ["Landslide"] },
  { handle: "@IMD_Shillong", time: "4h", text: "Heavy rainfall warning continues for next 24 hrs over Khasi & Jaintia Hills. #HeavyRain #WeatherAlert", tags: ["Heavy Rain"] },
  { handle: "@DDMA_Assam", time: "6h", text: "River levels being monitored closely in upper Brahmaputra basin. #FloodWatch", tags: ["Flood"] },
  { handle: "@EcoWatch_NER", time: "8h", text: "Real-time risk map updated. Three zones currently under HIGH watch. Field officers requested to submit geo-tagged reports.", tags: ["Landslide"] },
  { handle: "@ForestDept_ML", time: "11h", text: "No active forest fire alerts in the region at present. #ForestFire", tags: ["Forest Fire"] },
  { handle: "@NDMA_India", time: "1d", text: "Preparedness is key. Review your district contingency plans ahead of the monsoon peak. #DisasterPreparedness", tags: ["All"] },
];

export const MOCK_ADVISORIES = [
  {
    type: "LANDSLIDE",
    severity: "Yellow",
    areas: "East Khasi Hills, West Jaintia Hills",
    warning: "Continuous rainfall has elevated soil moisture. Slope movement possible on vulnerable stretches of NH-6 and approach roads to Cherrapunji. Restrict non-essential travel.",
    timeframe: "21 Sep 18:00 IST – 22 Sep 18:00 IST",
  },
  {
    type: "HEAVY RAIN",
    severity: "Orange",
    areas: "Khasi Hills district cluster",
    warning: "Rainfall intensity expected to remain high. Localised flooding of low-lying roads and waterlogging possible.",
    timeframe: "21 Sep 12:00 IST – 22 Sep 06:00 IST",
  },
];

export const MOCK_EVENTS = [
  { text: "Reviewed ***Risk Level: HIGH, Location: Mawlynnong sector, Date&Time: Mon Sep 21 14:18:22" },
  { text: "Reviewed ***Risk Level: MODERATE, Location: NH-6 km 42, Date&Time: Mon Sep 21 11:05:09" },
  { text: "Reviewed ***Risk Level: HIGH, Location: Cherrapunji approach, Date&Time: Sun Sep 20 19:44:51" },
  { text: "Reviewed ***Risk Level: LOW, Location: Shillong city periphery, Date&Time: Sun Sep 20 08:12:33" },
  { text: "Reviewed ***Risk Level: HIGH, Location: Jowai–Amlarem road, Date&Time: Sat Sep 19 16:30:07" },
];

export const MOCK_SERVICES = [
  { title: "Landslide Monitoring", desc: "Real-time slope & risk heatmaps" },
  { title: "Hydrological Services", desc: "Rainfall & flood risk tracking" },
  { title: "Meteorological Risk", desc: "Weather-linked forecasts" },
  { title: "Field Reporting", desc: "Geo-tagged citizen & officer reports" },
];