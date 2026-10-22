import { useRef, type KeyboardEvent } from "react";
import type { Lang } from "../copy";

const options: { lang: Lang; name: string }[] = [
  { lang: "en", name: "English" },
  { lang: "ms", name: "Bahasa Melayu" },
];

interface LanguageChoiceProps {
  label: string;
  lang: Lang;
  onChange: (lang: Lang) => void;
}

// The system's language choice. Each name is written in its own language. Arrow keys move the choice.
export function LanguageChoice({ label, lang, onChange }: LanguageChoiceProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    const next = lang === "en" ? 1 : 0;
    onChange(options[next].lang);
    buttons.current[next]?.focus();
  };

  return (
    <div
      className="lang-choice"
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
    >
      {options.map((o, i) => (
        <button
          key={o.lang}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          role="radio"
          lang={o.lang}
          aria-checked={o.lang === lang}
          tabIndex={o.lang === lang ? 0 : -1}
          onClick={() => onChange(o.lang)}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}
