import React from "react";

/**
 * Subtle fixed background: simplified North-Eastern Region silhouette
 * + soft topographic contour feel. Low opacity so content stays readable.
 * Pure SVG – no external assets required.
 */
export const NERMapBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(15,61,62,0.06) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 30% 70%, rgba(19,78,74,0.05) 0%, transparent 50%)",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft contour / elevation lines */}
        <g fill="none" stroke="#0f3d3e" strokeWidth="1.2" strokeLinecap="round">
          <path d="M40 480 Q120 420 200 460 T380 440 T560 470 T760 430" opacity="0.5" />
          <path d="M20 380 Q140 320 260 360 T480 340 T700 370" opacity="0.4" />
          <path d="M60 280 Q180 230 300 270 T520 250 T740 290" opacity="0.35" />
          <path d="M100 180 Q220 140 340 175 T560 160 T720 190" opacity="0.3" />
        </g>

        {/* Simplified NER region silhouette (Seven Sisters + Sikkim approximation) */}
        <g fill="#0f3d3e" fillOpacity="0.55">
          {/* Sikkim */}
          <path d="M210 95 L235 80 L260 95 L250 130 L220 125 Z" />
          {/* Arunachal Pradesh */}
          <path d="M260 70 L340 45 L430 55 L490 90 L470 150 L400 170 L320 155 L270 120 Z" />
          {/* Assam */}
          <path d="M220 160 L300 145 L400 155 L480 175 L510 220 L480 260 L400 275 L300 265 L230 240 L200 200 Z" />
          {/* Meghalaya */}
          <path d="M280 275 L360 270 L410 290 L400 330 L340 340 L280 320 Z" />
          {/* Nagaland */}
          <path d="M480 175 L530 160 L560 195 L540 240 L500 245 L475 210 Z" />
          {/* Manipur */}
          <path d="M500 250 L545 245 L560 290 L540 330 L500 325 L485 285 Z" />
          {/* Mizoram */}
          <path d="M490 330 L530 325 L545 380 L530 450 L500 460 L480 420 L475 360 Z" />
          {/* Tripura */}
          <path d="M400 340 L450 335 L465 380 L440 410 L400 400 L385 365 Z" />
        </g>

        {/* Faint state boundary hints */}
        <g fill="none" stroke="#0f3d3e" strokeWidth="0.8" opacity="0.4">
          <path d="M300 155 L300 265" />
          <path d="M400 155 L400 275" />
          <path d="M480 175 L480 260" />
        </g>

        {/* Location dots for major hubs */}
        <g fill="#c2410c" fillOpacity="0.7">
          <circle cx="320" cy="210" r="3.5" /> {/* Guwahati */}
          <circle cx="340" cy="300" r="2.5" /> {/* Shillong */}
          <circle cx="520" cy="285" r="2.5" /> {/* Imphal */}
          <circle cx="510" cy="400" r="2.5" /> {/* Aizawl */}
          <circle cx="250" cy="110" r="2" />   {/* Itanagar area */}
        </g>
      </svg>

      {/* Soft vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(241,245,249,0.85) 0%, transparent 18%, transparent 75%, rgba(241,245,249,0.9) 100%)",
        }}
      />
    </div>
  );
};