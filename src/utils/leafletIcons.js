import L from "leaflet";

/**
 * Small, distinct, legend-compatible markers.
 * No more oversized "API" badges.
 *
 * Types:
 *  - alert / critical  → red triangle
 *  - warning           → orange diamond
 *  - report            → blue circle
 *  - sensor / aws      → green circle
 *  - historical        → gray square
 *  - village           → small blue dot
 */
export const createNodeIcon = (typeOrLabel = "report", isSelected = false) => {
  const key = String(typeOrLabel).toLowerCase();

  let shape = "circle";
  let color = "#3b82f6"; // blue – field report
  let size = 12;

  if (key.includes("critical") || key.includes("extreme")) {
    shape = "triangle";
    color = "#dc2626";
    size = 14;
  } else if (key.includes("alert") || key.includes("high") || key.includes("warning")) {
    shape = "diamond";
    color = "#ea580c";
    size = 12;
  } else if (key.includes("aws") || key.includes("sensor") || key.includes("station")) {
    shape = "circle";
    color = "#059669";
    size = 11;
  } else if (key.includes("historical") || key.includes("hist")) {
    shape = "square";
    color = "#64748b";
    size = 10;
  } else if (key.includes("village")) {
    shape = "circle";
    color = "#2563eb";
    size = 8;
  }

  const border = isSelected ? "2.5px solid #fff" : "1.5px solid #fff";
  const shadow = isSelected
    ? `0 0 0 3px ${color}55`
    : "0 1px 3px rgba(0,0,0,0.35)";

  let inner = "";
  if (shape === "triangle") {
    inner = `
      <div style="
        width:0;height:0;
        border-left:${size / 2}px solid transparent;
        border-right:${size / 2}px solid transparent;
        border-bottom:${size}px solid ${color};
        filter: drop-shadow(${shadow});
      "></div>`;
  } else if (shape === "diamond") {
    inner = `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        transform:rotate(45deg);
        border:${border};
        box-shadow:${shadow};
      "></div>`;
  } else if (shape === "square") {
    inner = `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border:${border};
        box-shadow:${shadow};
      "></div>`;
  } else {
    inner = `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:${border};
        box-shadow:${shadow};
      "></div>`;
  }

  const html = `
    <div style="display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${inner}
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-leaflet-marker",
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
};