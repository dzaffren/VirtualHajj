import type { ReactNode } from "react";

interface TopCardProps {
  name: string;
  say?: ReactNode;
  hint?: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

// The walking HUD's top card: the one place copy appears, never on the scene.
export function TopCard({
  name,
  say,
  hint,
  body,
  action,
  children,
}: TopCardProps) {
  return (
    <div className="card">
      <p className="card-name">{name}</p>
      {say && (
        <p className="card-say" aria-live="polite">
          {say}
        </p>
      )}
      {hint && <p className="card-hint">{hint}</p>}
      {body && <p className="card-body">{body}</p>}
      {action}
      {children}
    </div>
  );
}
