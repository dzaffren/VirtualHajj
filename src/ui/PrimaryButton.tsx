import type { ButtonHTMLAttributes } from "react";

// The system's primary button, as the colour guideline defines it.
export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="primary-button" {...props} />;
}
