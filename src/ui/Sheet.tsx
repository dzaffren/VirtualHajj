import type { ReactNode } from "react";

interface SheetProps {
  titleId: string;
  children: ReactNode;
}

// The system's bottom sheet over a scrim, for the menu and the done card.
export function Sheet({ titleId, children }: SheetProps) {
  return (
    <>
      <div className="scrim" />
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {children}
      </section>
    </>
  );
}
