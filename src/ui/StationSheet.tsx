import { useEffect, useRef, type ReactNode } from "react";

interface StationSheetProps {
  station: string;
  title: string;
  arabicName: string;
  titleId: string;
  leaving: boolean;
  onGone: () => void;
  children: ReactNode;
}

// The system's station sheet. It rises from the bottom while the pilgrim stands still, with no scrim, so the top bar stays in reach.
// Focus moves to its first button, and leaves with it, so the arrow keys walk again.
export function StationSheet({
  station,
  title,
  arabicName,
  titleId,
  leaving,
  onGone,
  children,
}: StationSheetProps) {
  const sheet = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sheet.current;
    el?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      const now = document.activeElement;
      if (now instanceof HTMLElement && el?.contains(now)) now.blur();
    };
  }, []);

  return (
    <section
      ref={sheet}
      className={leaving ? "sheet station leaving" : "sheet station"}
      aria-labelledby={titleId}
      onAnimationEnd={leaving ? onGone : undefined}
    >
      <p className="station-name">{station}</p>
      <div className="station-title-row">
        <h2 className="station-title" id={titleId}>
          {title}
        </h2>
        <span className="station-arabic" lang="ar" dir="rtl">
          {arabicName}
        </span>
      </div>
      {children}
    </section>
  );
}
