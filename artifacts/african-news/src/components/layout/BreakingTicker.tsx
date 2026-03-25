import { useGetTopStories } from "@workspace/api-client-react";

export function BreakingTicker() {
  const { data } = useGetTopStories({ limit: 8 });
  const headlines = data?.articles?.map(a => a.title) ?? [
    "Loading latest headlines from across Africa…",
  ];

  const doubled = [...headlines, ...headlines];

  return (
    <div
      style={{
        background: "var(--accent)",
        color: "#fff",
        height: 36,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "var(--ink)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
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
            background: "var(--accent-2)",
            borderRadius: "50%",
            animation: "pulse-dot 1.4s ease-in-out infinite",
          }}
        />
        Breaking
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: "0 20px" }}>
        <div
          className="ticker-track"
          style={{ display: "flex", gap: 60, whiteSpace: "nowrap" }}
        >
          {doubled.map((title, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                fontWeight: 400,
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {title}
              {i < doubled.length - 1 && (
                <span style={{ opacity: 0.4, marginLeft: 60 }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
