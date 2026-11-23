/**
 * The demo's Spiti Valley route, drawn once on page load. A solid stroke in a
 * mask reveals the dashed route, so the dashes appear to be drawn by pen.
 */
const STOPS = [
  { x: 52, y: 392, name: "Shimla", date: "2 Nov", anchor: "start" as const, dx: 14, dy: 18 },
  { x: 168, y: 300, name: "Rampur", date: "3 Nov", anchor: "start" as const, dx: 14, dy: 22 },
  { x: 318, y: 262, name: "Nako", date: "5 Nov", anchor: "start" as const, dx: 14, dy: 24 },
  { x: 372, y: 148, name: "Key Monastery", date: "7 Nov", anchor: "end" as const, dx: -14, dy: 4 },
  { x: 470, y: 70, name: "Chandratal", date: "9 Nov", anchor: "end" as const, dx: -14, dy: -2 },
];

const ROUTE =
  "M52 392 C 92 360, 120 318, 168 300 S 262 296, 318 262 S 352 186, 372 148 S 430 92, 470 70";

export function RouteIllustration() {
  return (
    <svg viewBox="0 0 520 440" className="h-auto w-full" role="img" aria-labelledby="route-title">
      <title id="route-title">A journal route from Shimla to Chandratal, with an entry at each stop</title>
      <defs>
        <mask id="route-reveal">
          <path d={ROUTE} fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" className="route-draw" pathLength={1} />
        </mask>
      </defs>

      <path
        d={ROUTE}
        fill="none"
        stroke="var(--pen)"
        strokeWidth="3"
        strokeDasharray="7 8"
        strokeLinecap="round"
        mask="url(#route-reveal)"
      />

      {STOPS.map((s, i) => (
        <g key={s.name} className="route-stop" style={{ animationDelay: `${0.25 + i * 0.32}s` }}>
          <circle cx={s.x} cy={s.y} r={i === STOPS.length - 1 ? 8 : 6.5} fill={i === STOPS.length - 1 ? "var(--pen)" : "var(--ink)"} stroke="var(--paper)" strokeWidth="3" />
          <text x={s.x + s.dx} y={s.y + s.dy - 8} textAnchor={s.anchor} className="fill-ink" style={{ fontStretch: "75%", fontWeight: 650, fontSize: 17 }}>
            {s.name}
          </text>
          <text x={s.x + s.dx} y={s.y + s.dy + 10} textAnchor={s.anchor} className="fill-muted-foreground" style={{ fontStretch: "80%", fontSize: 14 }}>
            {s.date}
          </text>
        </g>
      ))}

      <style>{`
        .route-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: route-draw 1.9s cubic-bezier(.45,.05,.3,1) .2s forwards; }
        .route-stop { opacity: 0; animation: stop-in .35s ease-out forwards; }
        @keyframes route-draw { to { stroke-dashoffset: 0; } }
        @keyframes stop-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .route-draw { stroke-dashoffset: 0; animation: none; }
          .route-stop { opacity: 1; animation: none; }
        }
      `}</style>
    </svg>
  );
}
