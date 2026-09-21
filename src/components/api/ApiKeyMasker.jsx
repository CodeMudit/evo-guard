import React, { useState } from "react";
import { Eye, EyeOff, Key } from "lucide-react";

export const ApiKeyMasker = ({ apiKey }) => {
  const [showKey, setShowKey] = useState(false);

  const maskedKey = apiKey ? `${apiKey.substring(0, 5)}••••••••••••` : "sk_••••••••••••";

  return (
    <div className="flex items-center justify-between p-2.5 rounded bg-white border border-[var(--color-border)] text-xs shadow-sm">
      <div className="flex items-center gap-2 font-mono text-[var(--color-text-primary)]">
        <Key className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span className="font-bold text-[var(--color-text-muted)]">API KEY:</span>
        <span className="text-purple-700 font-bold">{showKey ? apiKey : maskedKey}</span>
      </div>

      <button
        onClick={() => setShowKey(!showKey)}
        className="p-1 rounded hover:bg-slate-50 text-[var(--color-text-secondary)] hover:text-slate-900 transition-colors"
        title={showKey ? "Hide API key" : "Show API key"}
      >
        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
