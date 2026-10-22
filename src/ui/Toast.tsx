import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

// The system's toast over the scene: one icon and one short line, on a surface.
export function Toast({
  icon,
  mistake = false,
  children,
}: {
  icon: IconName;
  mistake?: boolean;
  children: ReactNode;
}) {
  return (
    <p className={mistake ? "toast toast-mistake" : "toast"} role="status">
      <Icon name={icon} />
      <span>{children}</span>
    </p>
  );
}
