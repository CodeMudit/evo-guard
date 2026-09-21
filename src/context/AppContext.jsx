import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { initialAlerts } from "../data/mockAlerts";
import { initialApiData } from "../data/mockApiData";
import { initialHazards } from "../data/mockHazards";
import { initialReports } from "../data/mockReports";
import { generateHistoryData } from "../data/mockHistory";
import { initialMLState } from "../data/mockPredictions";
import { fetchWeather } from "../services/weatherApi";
import { API_URL } from "../config";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [activePage, setActivePage] = useState("overview");

    const firebaseHistory = generateHistoryData("24h");
    const isFirebaseLoading = false;

    const [apiData, setApiData] = useState(initialApiData);

    const [alerts, setAlerts] = useState(initialAlerts);
    const [hazards, setHazards] = useState(initialHazards);
    const [reports, setReports] = useState(initialReports);
    const [currentMLPrediction, setCurrentMLPrediction] = useState(initialMLState);

    const [thresholds, setThresholds] = useState({
        soilMoisture: 70, // %
        rainfall: 40, // mm/h
        pm25: 60, // µg/m³
        waterLevel: 2.0, // m
        aqi: 100,
    });

    const [mlCategory, setMlCategory] = useState("Overall"); // Overall, Landslide, Flood, AirQuality
    const [selectedAlertId, setSelectedAlertId] = useState(null);
    const [selectedHazardId, setSelectedHazardId] = useState(null);
    const [mapTarget, setMapTarget] = useState(null);

    const [isLiveSimulating, setIsLiveSimulating] = useState(false);
    const [refreshRateSec, setRefreshRateSec] = useState(15);
    const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date().toLocaleTimeString());

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("evoguard_theme") || "dark";
    });
    const [fontSize, setFontSize] = useState(() => localStorage.getItem("evoguard_fontsize") || "16px");
    const [contrast, setContrast] = useState(() => Number(localStorage.getItem("evoguard_contrast")) || 1);
    const [toasts, setToasts] = useState([]);

    // Theme & Accessibility synchronization effect
    useEffect(() => {
        localStorage.setItem("evoguard_theme", theme);
        localStorage.setItem("evoguard_fontsize", fontSize);
        localStorage.setItem("evoguard_contrast", contrast.toString());

        document.documentElement.style.setProperty("--base-font-size", fontSize);
        document.documentElement.style.setProperty("--base-contrast", contrast);

        if (theme === "light") {
            document.documentElement.classList.add("light-theme");
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.remove("light-theme");
            document.documentElement.classList.add("dark");
        }
        
        if (contrast > 1) {
            document.documentElement.classList.add("high-contrast");
        } else {
            document.documentElement.classList.remove("high-contrast");
        }
    }, [theme, fontSize, contrast]);

    // Toast Helper
    const addToast = useCallback((title, message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = id => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Initial Data Fetching from Backend API (if API_URL configured)
    useEffect(() => {
        if (!API_URL) return;

        // Fetch Reports 
        fetch(`${API_URL}/api/reports`)
            .then(res => res.json())
            .then(json => {
                if (json.success && Array.isArray(json.data)) {
                    setReports(json.data);
                }
            })
            .catch(err => console.warn("Failed to fetch /api/reports:", err.message));

        // Fetch Weather
        fetch(`${API_URL}/api/weather/current`)
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data) {
                    setApiData(prev => ({ ...prev, ...json.data }));
                }
            })
            .catch(err => console.warn("Failed to fetch /api/weather/current:", err.message));
    }, []);

    // Real-time Socket.IO Connection (Alerts, Weather)
    useEffect(() => {
        if (!API_URL) return;

        const socket = io(API_URL, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
        });

        socket.on("connect", () => {});

        socket.on("weather:update", payload => {
            if (payload && payload.weather) {
                const timeStr = new Date().toLocaleTimeString();
                setLastRefreshedAt(timeStr);
                setApiData(prev => ({
                    ...prev,
                    lastUpdate: timeStr,
                    sensors: {
                        ...prev.sensors,
                        temperature: {
                            ...prev.sensors.temperature,
                            value: payload.weather.temperature ?? prev.sensors.temperature.value,
                        },
                        aqi: {
                            ...prev.sensors.aqi,
                            value: payload.weather.aqi ?? prev.sensors.aqi.value,
                        },
                        rainfall: {
                            ...prev.sensors.rainfall,
                            value: payload.weather.rainfall ?? prev.sensors.rainfall.value,
                        },
                    },
                }));
            }
        });

        socket.on("alert:new", payload => {
            if (payload && payload.alert) {
                setAlerts(prev => [payload.alert, ...prev]);
                addToast("Critical Alert", payload.alert.title, "warning");
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [addToast]);

    // Refresh All Data
    const refreshAllData = useCallback(
        (isAuto = false) => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            setLastRefreshedAt(timeStr);

            if (API_URL) {
                fetch(`${API_URL}/api/weather/current`)
                    .then(r => r.json())
                    .then(d => d.success && d.data && setApiData(d.data))
                    .catch(() => {});
                if (!isAuto) {
                    addToast("Data Refreshed", `System synchronized at ${timeStr}`, "success");
                }
                return;
            }

            fetchWeather().then(liveWeather => {
               if (liveWeather) {
                  setApiData(prevApi => ({
                     ...prevApi,
                     lastUpdate: timeStr,
                     sensors: {
                           ...prevApi.sensors,
                           temperature: { ...prevApi.sensors.temperature, value: liveWeather.temperature },
                           rainfall: { ...prevApi.sensors.rainfall, value: liveWeather.rainfall },
                           windSpeed: { ...prevApi.sensors.windSpeed, value: liveWeather.windSpeed },
                           pressure: { ...prevApi.sensors.pressure, value: liveWeather.pressure },
                     }
                  }));
               }
            });

            if (!isAuto) {
                addToast("Data Refreshed", `System synchronized at ${timeStr}`, "success");
            }
        },
        [addToast],
    );

    // Live Simulation interval loop (fallback or sync ticker)
    useEffect(() => {
        if (!isLiveSimulating) return;
        const timer = setInterval(() => {
            refreshAllData(true);
        }, refreshRateSec * 1000);
        return () => clearInterval(timer);
    }, [isLiveSimulating, refreshRateSec, refreshAllData]);

    // Alert Handlers
    const acknowledgeAlert = alertId => {
        setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: "Acknowledged" } : a)));
        addToast("Alert Acknowledged", `Alert ${alertId} status updated to Acknowledged.`, "warning");
        if (API_URL) {
            fetch(`${API_URL}/api/alerts/${alertId}/acknowledge`, { method: "PATCH" }).catch(err =>
                console.warn("Failed to sync acknowledge to backend:", err.message),
            );
        }
    };

    const resolveAlert = alertId => {
        setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: "Resolved" } : a)));
        addToast("Alert Resolved", `Alert ${alertId} marked as Resolved.`, "success");
        if (API_URL) {
            fetch(`${API_URL}/api/alerts/${alertId}/resolve`, { method: "PATCH" }).catch(err =>
                console.warn("Failed to sync resolve to backend:", err.message),
            );
        }
    };

    // Threshold update handler
    const updateThresholds = newThresholds => {
        setThresholds(newThresholds);
        addToast("Settings Saved", "Alert thresholds updated dynamically.", "success");
        if (API_URL) {
            fetch(`${API_URL}/api/settings/thresholds`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newThresholds),
            }).catch(err => console.warn("Failed to sync thresholds to backend:", err.message));
        }
    };

    // Add Incident Report
    const addReportedSection = newReport => {
        const reportObj = {
            id: `rep-${Date.now()}`,
            timeAgo: "Just now",
            timestamp: new Date().toISOString(),
            status: "New",
            ...newReport,
        };
        setReports(prev => [reportObj, ...prev]);
        addToast("Incident Reported", `New report '${reportObj.title}' logged into system.`, "info");
        if (API_URL) {
            fetch(`${API_URL}/api/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newReport.title,
                    location: newReport.location,
                    severity: newReport.severity,
                    reportedBy: newReport.reportedBy,
                    description: newReport.description,
                }),
            }).catch(err => console.warn("Failed to sync report to backend:", err.message));
        }
    };

    // Update Incident Report Status
    const updateReportStatus = (reportId, newStatus) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        addToast("Report Updated", `Report status updated to ${newStatus}.`, "success");
    };

    // Map Navigation helper
    const focusOnMap = (lat, lng, zoom = 14) => {
        setMapTarget({ lat, lng, zoom, timestamp: Date.now() });
        if (activePage !== "risk-map") {
            setActivePage("risk-map");
        }
    };

    // Fallback Mock Risk Data for legacy UI components
    const computedRisk = {
        overallScore: 78,
        overallLevel: "HIGH",
        landslideScore: 82,
        landslideLevel: "HIGH",
        floodScore: 45,
        floodLevel: "MEDIUM",
        airQualityScore: 55,
        airQualityLevel: "MODERATE",
        events: {
           landslide: { active: true },
           flood: { active: false },
           air: { active: false }
        },
        anyCritical: false,
        allCritical: false,
        critSoil: true,
        critWater: false,
        critDecRate: false
    };

    return (
        <AppContext.Provider
            value={{
                activePage,
                setActivePage,
                apiData,
                alerts,
                reports,
                hazards,
                computedRisk,
                currentMLPrediction,
                setCurrentMLPrediction,
                thresholds,
                updateThresholds,
                mlCategory,
                setMlCategory,
                selectedAlertId,
                setSelectedAlertId,
                selectedHazardId,
                setSelectedHazardId,
                mapTarget,
                focusOnMap,
                isLiveSimulating,
                setIsLiveSimulating,
                refreshRateSec,
                setRefreshRateSec,
                lastRefreshedAt,
                refreshAllData,
                acknowledgeAlert,
                resolveAlert,
                addReportedSection,
                updateReportStatus,
                theme,
                setTheme,
                fontSize,
                setFontSize,
                contrast,
                setContrast,
                toasts,
                addToast,
                removeToast,
                firebaseHistory,
                isFirebaseLoading,
            }}
        >
            <div className={theme === "light" ? "light-theme min-h-screen" : "dark min-h-screen"}>{children}</div>
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
