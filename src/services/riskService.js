/**
 * riskService.js
 * 
 * Future model contract abstraction for Landslide prediction.
 * Implements POST /api/v1/risk/predict
 */

export const predictRisk = async (locationData) => {
    // In production, this would POST to our ML endpoint:
    // const res = await fetch('/api/v1/risk/predict', { method: 'POST', body: JSON.stringify(locationData) });
    
    // For now, return deterministic "Derived Prototype" data based on inputs
    const rain24h = parseFloat(locationData?.rainfall?.rain24h?.value || 0);
    const soilMoisture = parseFloat(locationData?.soil?.moisture?.value || 30);
    const elevation = locationData?.terrain?.elevation?.value || 1000;

    const rainScore = Math.min(100, (rain24h / 150) * 100);
    const soilScore = Math.min(100, (soilMoisture / 80) * 100);
    const terrainScore = elevation > 1400 ? 80 : elevation > 1200 ? 60 : 30;
    
    // deterministic mock values
    const historicalScore = 45; 
    const infraScore = 60;

    const totalScore = Math.round(
        (rainScore * 0.35) +
        (soilScore * 0.25) +
        (terrainScore * 0.20) +
        (historicalScore * 0.12) +
        (infraScore * 0.08)
    );

    let riskLevel = "LOW";
    if (totalScore >= 75) riskLevel = "EXTREME";
    else if (totalScore >= 60) riskLevel = "HIGH";
    else if (totalScore >= 40) riskLevel = "MEDIUM";

    return {
        score: totalScore,
        level: riskLevel,
        confidence: "MODERATE", // derived from mock evidence agreement
        model_version: "DERIVED PROTOTYPE v1.0",
        status: "MODEL NOT DEPLOYED",
        prediction_timestamp: new Date().toISOString(),
        factors: [
            { name: "Rainfall (24h)", contribution: `${Math.round(rainScore * 0.35)} pts` },
            { name: "Soil Saturation", contribution: `${Math.round(soilScore * 0.25)} pts` },
            { name: "Terrain Susceptibility", contribution: `${Math.round(terrainScore * 0.20)} pts` },
            { name: "Historical Frequency", contribution: `${Math.round(historicalScore * 0.12)} pts` },
            { name: "Infrastructure Exposure", contribution: `${Math.round(infraScore * 0.08)} pts` }
        ]
    };
};

export const fetchAdaptiveThreshold = async (locationId, currentRainfall) => {
    // Implements GET /api/v1/risk/locations/{id}/threshold
    const thresholdValue = 68.0; 
    
    return {
        threshold_type: "DERIVED / EXPERIMENTAL",
        threshold_value: thresholdValue,
        time_window: "24h",
        terrain_class: "Steep Slope",
        landslide_type: "Debris Flow",
        current_rainfall: currentRainfall,
        threshold_exceeded: currentRainfall > thresholdValue,
        exceedance_margin: Math.max(0, currentRainfall - thresholdValue),
        confidence: "LOW"
    };
};
