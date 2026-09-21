import { API_CONFIG } from '../api/config';
import { apiClient } from '../api/apiClient';
import { demoProvider } from './demoProvider';

/**
 * Risk Service
 * Acts as the abstraction layer between the UI and the backend APIs.
 * Automatically delegates to DemoProvider if API_CONFIG.MODE === "demo"
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

  async predictRisk(pointData) {
    // POST /api/v1/risk/predict
    // For demo/prototype, simulate the derived prototype risk calculation
    await new Promise(res => setTimeout(res, 50)); // tiny mock delay

    if (!pointData || !pointData.rainfall || !pointData.soil) {
       return { level: 'UNKNOWN', confidence: 'LOW', status: 'DERIVED PROTOTYPE' };
    }

    const rain = parseFloat(pointData.rainfall?.rain24h?.value || 0);
    const soil = parseFloat(pointData.soil?.moisture?.value || 0);
    const elev = pointData.terrain?.elevation?.value || 0;

    let level = "LOW";
    if (rain > 100 && soil > 70) level = "EXTREME";
    else if (rain > 50 && soil > 50) level = "HIGH";
    else if (rain > 20 || soil > 40) level = "ELEVATED";

    return { 
        level, 
        confidence: 'MODERATE', 
        status: 'DERIVED PROTOTYPE',
        model_version: 'NOT DEPLOYED'
    };
  }
}

export const riskService = new RiskService();
export const predictRisk = (data) => riskService.predictRisk(data);
