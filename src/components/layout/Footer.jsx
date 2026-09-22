import React from "react";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[var(--gov-primary)] text-white mt-auto relative z-10">
      <div className="w-full px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-semibold text-[15px] mb-1">{t("appName")}</h3>
            <p className="text-[13px] text-white/80 leading-relaxed">
              {t("appTagline")} — SIH26001 prototype for the North-Eastern Regional Node for Disaster Risk Reduction.
            </p>
          </div>
          <div className="text-[13px] text-white/80 space-y-1">
            <p>Ministry of DoNER · NESAC</p>
            <p>Smart India Hackathon 2026</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-white/75">
          <span>© {new Date().getFullYear()} EvoGuard · Prototype system with simulated data</span>
          <span>Built for operational situational awareness in the NER</span>
        </div>
      </div>
    </footer>
  );
};