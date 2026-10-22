import { useEffect, useRef, type ReactNode } from "react";

interface SheetProps {
  titleId: string;
  leaving: boolean;
  onGone: () => void;
  onClose?: () => void;
  children: ReactNode;
}

// The system's bottom sheet over a scrim, for the menu and the done card.
// Focus moves into it when it opens, and goes back where it was when it closes. Escape closes it, if it can close.
export function Sheet({
  titleId,
  leaving,
  onGone,
  onClose,
  children,
}: SheetProps) {
  const sheet = useRef<HTMLElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    sheet.current?.querySelector<HTMLElement>("button")?.focus();
    return () => before?.focus();
  }, []);

  useEffect(() => {
    if (!onClose || leaving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, leaving]);

  return (
    <>
      <div className={leaving ? "scrim leaving" : "scrim"} />
      <section
        ref={sheet}
        className={leaving ? "sheet leaving" : "sheet"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={leaving ? onGone : undefined}
      >
        {children}
      </section>
    </>
  );
}
