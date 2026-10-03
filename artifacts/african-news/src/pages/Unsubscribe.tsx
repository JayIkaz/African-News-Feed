import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePageMeta } from "@/lib/usePageMeta";
import { CONTACT_EMAIL } from "@/lib/site";

type Status = "idle" | "working" | "done" | "error";

// The link in the email opens this page and asks for a click. Unsubscribing
// straight from the link would let a mail scanner that opens every link in a
// message unsubscribe people by accident.
export default function Unsubscribe() {
  usePageMeta({ title: "Unsubscribe | AfricaNews", noindex: true });

  const params = new URLSearchParams(window.location.search);
  const email = params.get("e") ?? "";
  const token = params.get("t") ?? "";
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const unsubscribe = async () => {
    setStatus("working");
    setMessage("");
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/newsletter/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e: email, t: token }),
      });
      if (res.ok) {
        setStatus("done");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(
        body.error === "invalid_link"
          ? `This link is not valid. Open the link in your email again, or write to ${CONTACT_EMAIL} and we will remove you.`
          : "We could not unsubscribe you. Try again in a moment.",
      );
      setStatus("error");
    } catch {
      setMessage("We could not reach the site. Check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <AppLayout>
      <div className="an-page">
        <h1>Unsubscribe</h1>
        {!email || !token ? (
          <p>
            This link is incomplete. Open the link in your email again, or write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will remove you.
          </p>
        ) : status === "done" ? (
          <p role="status">You have been unsubscribed. We have deleted your email address.</p>
        ) : (
          <>
            <p>Stop emails from AfricaNews to {email}?</p>
            <button className="an-page-button" type="button" onClick={unsubscribe} disabled={status === "working"}>
              {status === "working" ? "Unsubscribing…" : "Unsubscribe"}
            </button>
            {status === "error" && (
              <p className="an-page-error" role="alert">{message}</p>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
