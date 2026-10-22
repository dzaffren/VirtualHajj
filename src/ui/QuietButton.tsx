import type { ButtonHTMLAttributes } from "react";

// The system's quiet button: accent-ink text, no fill until hover.
export function QuietButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="quiet-button" {...props} />;
}
