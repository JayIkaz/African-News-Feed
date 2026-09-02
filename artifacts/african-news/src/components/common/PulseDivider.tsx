// Spec §5 — signature element.
//
// A thin waveform line marking the boundary between the top story and the
// feed, echoing the AfricaNews pulse-through-Africa-silhouette logo. Per the
// spec this replaces a plain hairline rule at that ONE boundary and is not
// repeated elsewhere, so it stays a signature rather than becoming
// decoration. Decorative only — hidden from assistive tech.
export function PulseDivider() {
  return (
    <div className="an-pulse-divider" aria-hidden="true">
      <svg viewBox="0 0 400 16" preserveAspectRatio="none">
        <polyline
          points="0,8 160,8 172,2 184,14 196,8 400,8"
          fill="none"
          stroke="rgba(242,241,237,0.18)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
