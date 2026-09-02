import { useGetTopStories } from "@workspace/api-client-react";

export function BreakingTicker() {
  const { data } = useGetTopStories({ limit: 8 });
  const headlines = data?.articles?.map(a => a.title) ?? [
    "Loading latest headlines from across Africa…",
  ];
  const doubled = [...headlines, ...headlines];
  return (
    <div
      className="an-breaking-ticker"
      style={{
        // Spec §1 reserves --live for urgency signals, "never decorative".
        // A full-bleed red bar above a --paper header read as decoration and
        // put white on --live at 3.72:1 for every headline. The urgency now
        // lives in the label — a pulsing --live dot and --live wordmark —
        // while the headlines sit on --paper as --ink (16:1).
        background: "var(--paper)",
        color: "var(--ink)",
        borderBottom: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 100,
      }}
    >
      <div
        className="an-breaking-label"
        style={{
          color: "var(--live)",
          // The label used to be separated by its own darker fill; with both
          // sides on --paper it needs an explicit hairline.
          borderRight: "1px solid var(--line)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
          gap: 6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            background: "var(--live)",
            borderRadius: "50%",
            animation: "pulse-dot 1.4s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <span className="an-breaking-label-text">Breaking</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: "0 12px" }}>
        <div
          className="ticker-track"
          style={{ display: "flex", gap: 60, whiteSpace: "nowrap" }}
        >
          {doubled.map((title, i) => (
            <span
              key={i}
              className="an-ticker-item"
              style={{
                fontFamily: "var(--font-ui)",
                fontWeight: 400,
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {title}
              {i < doubled.length - 1 && (
                <span style={{ color: "var(--ink-faint)", marginLeft: 60 }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
