import React, { useState, useEffect } from "react";
import { WifiOff, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-2 z-50 text-sm font-bold shadow-md w-full shrink-0"
    >
      <WifiOff className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="flex-1 text-center truncate">
        <AlertTriangle className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
        {t("You are currently offline. Field reports and actions are being queued locally.")}
      </span>
    </div>
  );
};
