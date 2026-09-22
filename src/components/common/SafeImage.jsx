import React, { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Never renders raw [Image] or broken alt text.
 * Falls back to a neutral icon box on error / missing src.
 */
export const SafeImage = ({ src, alt = "", className = "", fallbackIconSize = 24 }) => {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--gov-page-bg)] text-[var(--gov-text-muted)] ${className}`}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <ImageOff style={{ width: fallbackIconSize, height: fallbackIconSize }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};