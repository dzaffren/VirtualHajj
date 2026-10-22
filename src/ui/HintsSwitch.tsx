interface HintsSwitchProps {
  label: string;
  on: boolean;
  onWord: string;
  offWord: string;
  onChange: (on: boolean) => void;
}

// The system's hints switch: a label, a track with a thumb, and the state in words.
export function HintsSwitch({
  label,
  on,
  onWord,
  offWord,
  onChange,
}: HintsSwitchProps) {
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    >
      <span className="switch-label">{label}</span>
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
      <span className="switch-word">{on ? onWord : offWord}</span>
    </button>
  );
}
