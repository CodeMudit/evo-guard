import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let border = "border-blue-200 bg-blue-50 text-blue-800";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          border = "border-emerald-200 bg-emerald-50 text-emerald-800";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          border = "border-amber-200 bg-amber-50 text-amber-800";
        } else if (toast.type === "error") {
          Icon = AlertTriangle;
          border = "border-red-200 bg-red-50 text-red-800";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded border shadow-lg backdrop-blur-md flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-3 ${border}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold">{toast.title}</p>
              <p className="text-xs font-medium leading-relaxed opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100 p-1 rounded transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
