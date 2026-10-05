import { useEffect, useState } from "react";

// The current time, refreshed once a minute and when the tab comes back to the
// front (a hidden tab's timers are slowed down by the browser). Lists that sort
// stories into "Last hour" and "Earlier today" use it so a story moves down as
// it ages without the page being reloaded.
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
  return now;
}
