import { API_CONFIG } from '../api/config';
import { apiClient } from '../api/apiClient';
import { demoProvider } from './demoProvider';

/**
 * Risk Service
 * Abstraction between UI and backend APIs.
 * predictRisk now consumes live terrain / NDVI / susceptibility from satellite adapter.
 */
class RiskService {
  isDemo() {
    return API_CONFIG.MODE === 'demo';
  }

  async getSystemStatus() {
    if (this.isDemo()) return demoProvider.getSystemStatus();
    return apiClient.get('/system/status');
  }

  async getModels() {
    if (this.isDemo()) return demoProvider.getModels();
    return apiClient.get('/models');
  }

  async getModelStatus(modelId) {
    if (this.isDemo()) return demoProvider.getModelStatus(modelId);
    return apiClient.get(`/models/${modelId}/status`);
  }

  async getLocations(params) {
    if (this.isDemo()) return demoProvider.getLocations(params);
    return apiClient.get('/risk/locations', params);
  }

  async getLocationIntelligence(locationId) {
    if (this.isDemo()) return demoProvider.getLocationIntelligence(locationId);
    return apiClient.get(`/risk/locations/${locationId}`);
  }

  async getTrajectory(locationId) {
    if (this.isDemo()) return demoProvider.getTrajectory(locationId);
    return apiClient.get(`/risk/locations/${locationId}/trajectory`);
  }

  async getExplanation(locationId) {
    if (this.isDemo()) return demoProvider.getExplanation(locationId);
    return apiClient.get(`/risk/locations/${locationId}/explanation`);
  }

  async getImpact(locationId) {
    if (this.isDemo()) return demoProvider.getImpact(locationId);
    return apiClient.get(`/impact/${locationId}`);
  }

  async getIsolation(locationId) {
    if (this.isDemo()) return demoProvider.getIsolation(locationId);
    return apiClient.get(`/isolation/${locationId}`);
  }

  async getSources() {
    if (this.isDemo()) return demoProvider.getSources();
    return apiClient.get('/sources');
  }

  /**
   * Derive categorical risk from point intelligence (weather + terrain + NDVI).
   * Inputs from satelliteDataService feed susceptibility / slope / ndvi.
   */
  async predictRisk(pointData) {
    await new Promise((res) => setTimeout(res, 30));

    if (!pointData) {
      return { level: 'UNKNOWN', confidence: 'LOW', status: 'DERIVED PROTOTYPE', score: 0 };
    }

    const rain = parseFloat(pointData.rainfall?.rain24h?.value || 0);
    const soil = parseFloat(pointData.soil?.moisture?.value || 0);
    const elev = parseFloat(pointData.terrain?.elevation?.value || 0);
    const slope = parseFloat(pointData.terrain?.slope?.value || 0);
    const ndvi = pointData.ndvi?.value != null ? parseFloat(pointData.ndvi.value) : null;
    const satScore = pointData.susceptibility?.score != null
      ? parseFloat(pointData.susceptibility.score)
      : null;

    // Weighted score 0–100
    let score = 0;
    // Rainfall weight
    if (rain > 100) score += 35;
    else if (rain > 50) score += 25;
    else if (rain > 20) score += 12;
    else score += Math.min(10, rain / 5);

    // Soil moisture
    if (soil > 70) score += 25;
    else if (soil > 50) score += 15;
    else if (soil > 40) score += 8;
    else score += soil / 10;

    // Terrain slope (steep slopes amplify risk)
    if (slope > 35) score += 20;
    else if (slope > 25) score += 12;
    else if (slope > 15) score += 6;

    // NDVI: low vegetation → higher bare-soil risk
    if (ndvi != null) {
      if (ndvi < 0.25) score += 15;
      else if (ndvi < 0.4) score += 8;
      else score += 2;
    }

    // Blend with satellite susceptibility when present
    if (satScore != null) {
      score = Math.round(score * 0.65 + satScore * 0.35);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let level = 'LOW';
    if (score >= 80) level = 'EXTREME';
    else if (score >= 60) level = 'HIGH';
    else if (score >= 40) level = 'ELEVATED';
    else if (score >= 25) level = 'MODERATE';

    const factors = [];
    if (rain > 20) factors.push({ name: 'rainfall_24h', value: rain, weight: 'high' });
    if (soil > 40) factors.push({ name: 'soil_moisture', value: soil, weight: 'high' });
    if (slope > 15) factors.push({ name: 'slope', value: slope, weight: 'medium' });
    if (ndvi != null) factors.push({ name: 'ndvi', value: ndvi, weight: 'medium' });
    if (elev > 0) factors.push({ name: 'elevation', value: elev, weight: 'low' });

    return {
      level,
      score,
      confidence: satScore != null || ndvi != null ? 'MODERATE' : 'LOW',
      status: 'DERIVED PROTOTYPE',
      model_version: 'NOT DEPLOYED',
      factors,
      inputs_used: {
        rainfall_24h: rain,
        soil_moisture: soil,
        slope,
        elevation: elev,
        ndvi,
        susceptibility_score: satScore,
      },
    };
  }
}

export const riskService = new RiskService();
export const predictRisk = (data) => riskService.predictRisk(data);
