/**
 * Demo Provider
 * Supplies strictly typed simulated data when API_CONFIG.MODE === "demo"
 */
class DemoProvider {
  async getSystemStatus() {
    return {
      status: "healthy",
      mode: "demo",
      last_model_update: "Not deployed",
      data_sources: {
        rainfall: "fresh",
        soil_moisture: "fresh",
        satellite: "delayed",
        field_reports: "fresh"
      }
    };
  }

  async getModels() {
    return {
      models: [
        {
          id: "landslide-risk",
          name: "EvoGuard Landslide Risk Model",
          version: "pending-training",
          status: "not_deployed",
          provider: "internal",
          last_updated: null
        }
      ]
    };
  }

  async getModelStatus(modelId) {
    return {
      model_id: modelId,
      status: "not_deployed",
      version: null,
      last_inference: null
    };
  }

  async getLocations(params) {
    // Return mock locations
    return {
      locations: [
        {
          id: "loc_001",
          name: "NH-10 / Teesta Corridor",
          district: "Sikkim",
          state: "Sikkim",
          coordinates: { lat: 27.2, lng: 88.4 },
          risk: {
            current: 78,
            risk_6h: 79,
            risk_24h: 83,
            risk_72h: 81,
            trend: "rising"
          },
          confidence: "low",
          isolation: "critical",
          source: "demo",
          impact_summary: {
            communities: 4,
            hospital_routes: 1
          },
          recommended_action: "Inspect slope"
        },
        {
          id: "loc_002",
          name: "Shillong Bypass",
          district: "East Khasi Hills",
          state: "Meghalaya",
          coordinates: { lat: 25.5, lng: 91.9 },
          risk: {
            current: 45,
            risk_6h: 46,
            risk_24h: 42,
            risk_72h: 40,
            trend: "stable"
          },
          confidence: "medium",
          isolation: "moderate",
          source: "demo",
          impact_summary: {
            communities: 2,
            hospital_routes: 0
          },
          recommended_action: "Monitor"
        }
      ]
    };
  }

  async getLocationIntelligence(locationId) {
    return {
      location: {
        id: locationId,
        name: "NH-10 / Teesta Corridor",
        district: "Sikkim",
        state: "Sikkim",
        coordinates: { lat: 27.2, lng: 88.4 }
      },
      risk: {
        current: 78,
        risk_6h: 79,
        risk_24h: 83,
        risk_72h: 81,
        trend: "rising",
        status: "model_not_deployed",
        source: "simulation"
      },
      trajectory: {
        historical: [
          { label: "6h ago", risk: 42 },
          { label: "3h ago", risk: 51 },
          { label: "1h ago", risk: 67 },
          { label: "Now", risk: 78 }
        ],
        forecast: [
          { label: "Next 6h", risk: 79 },
          { label: "Next 24h", risk: 83 }
        ],
        trend: "rising"
      },
      drivers: [
        { feature: "rainfall", label: "Rainfall accumulation", contribution: 24, direction: "increasing" },
        { feature: "soil_moisture", label: "Soil saturation", contribution: 19, direction: "increasing" },
        { feature: "slope", label: "Steep slope", contribution: 15, direction: "stable" },
        { feature: "deformation", label: "Terrain deformation", contribution: 12, direction: "increasing" }
      ],
      impact: {
        roads_km: 12.4,
        villages: 4,
        population_exposed: 2180,
        hospitals: 0,
        hospital_routes: 1,
        schools: 2,
        bridges: 3
      },
      isolation: {
        score: 85,
        severity: "CRITICAL",
        affected_communities: ["Village A", "Village B", "Village C", "Village D"],
        alternative_routes: ["Route B (Not recommended)"],
        travel_time_penalty_minutes: 47,
        reason: "Only motorable connection to 4 communities.",
        status: "demo"
      },
      evidence: [
        { time: "08:10", event: "Rainfall increased" },
        { time: "09:25", event: "Soil moisture increased" },
        { time: "10:40", event: "Forecast changed" },
        { time: "11:05", event: "Deformation signal observed" },
        { time: "11:18", event: "Field report submitted" },
        { time: "11:21", event: "Risk escalated" }
      ],
      recommended_actions: [
        { id: "act_1", priority: 1, title: "Inspect slope", reason: "Recent field report indicates surface cracking", status: "recommended" },
        { id: "act_2", priority: 2, title: "Stage clearing equipment", reason: "High probability of road blockage", status: "recommended" }
      ],
      data_freshness: {
        rainfall: { status: "fresh", text: "Updated 3 min ago" },
        soil: { status: "fresh", text: "Updated 42 sec ago" },
        satellite: { status: "delayed", text: "Updated 2 days ago" },
        historical: { status: "static", text: "Static dataset" }
      },
      model: {
        id: "landslide-risk",
        status: "model_not_deployed"
      }
    };
  }

  async getTrajectory(locationId) {
    const data = await this.getLocationIntelligence(locationId);
    return data.trajectory;
  }

  async getExplanation(locationId) {
    const data = await this.getLocationIntelligence(locationId);
    return {
      drivers: data.drivers,
      summary: "Risk is primarily driven by recent heavy rainfall combined with highly saturated soil on a steep slope.",
      status: "model_not_deployed"
    };
  }

  async getImpact(locationId) {
    const data = await this.getLocationIntelligence(locationId);
    return data.impact;
  }

  async getIsolation(locationId) {
    const data = await this.getLocationIntelligence(locationId);
    return data.isolation;
  }

  async getSources() {
    return {
      sources: [
        { name: "Rainfall", category: "weather", status: "demo", last_update: "3 mins ago", mode: "simulation" },
        { name: "Soil Moisture", category: "sensor", status: "demo", last_update: "1 min ago", mode: "simulation" },
        { name: "Terrain", category: "satellite", status: "demo", last_update: "2 days ago", mode: "simulation" },
        { name: "Historical", category: "historical", status: "demo", last_update: "Static", mode: "simulation" }
      ]
    };
  }
}

export const demoProvider = new DemoProvider();
