import { useId, useState } from "react";
import { Link } from "wouter";

type Status = "idle" | "submitting" | "done" | "error";

const GENERIC_ERROR = "We could not subscribe you. Check your connection and try again.";

// One sign-up form for the sidebar and the footer. It says what we do with the
// address, links to the privacy page, shows the outcome of the request, and
// keeps the typed address after a failure so the reader can retry.
export function NewsletterForm() {
  const inputId = useId();
  const messageId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [subscribedAs, setSubscribedAs] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    setStatus("submitting");
    setError("");
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });
      if (!res.ok) {
        setError(
          res.status === 400
            ? "Enter a valid email address."
            : res.status === 429
              ? "Too many attempts. Wait a few minutes and try again."
              : GENERIC_ERROR,
        );
        setStatus("error");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { emailSent?: boolean };
      setEmailSent(body.emailSent === true);
      setSubscribedAs(address);
      setEmail("");
      setStatus("done");
    } catch {
      setError(GENERIC_ERROR);
      setStatus("error");
    }
  };

  return (
    <div>
      <h3 className="an-nl-title">Newsletter</h3>
      <p className="an-nl-blurb">
        Join the mailing list. We store your email address to contact you about AfricaNews, and every email has an unsubscribe link.
      </p>
      {status === "done" ? (
        <p className="an-nl-status" role="status">
          {emailSent
            ? `You are on the list. A welcome email is on its way to ${subscribedAs}.`
            : "You are on the list. We have saved your address."}
        </p>
      ) : (
        <form className="an-nl-form" onSubmit={submit}>
          <label className="an-nl-label" htmlFor={inputId}>Email address</label>
          <input
            id={inputId}
            className="an-nl-input"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? messageId : undefined}
          />
          {status === "error" && (
            <p id={messageId} className="an-nl-error" role="alert">{error}</p>
          )}
          <button className="an-nl-button" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      )}
      <p className="an-nl-note">
        We use your address as described in our <Link href="/privacy">Privacy page</Link>.
      </p>
    </div>
  );
}
