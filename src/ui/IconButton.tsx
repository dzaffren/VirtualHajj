import { Icon, type IconName } from "./Icon";

interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick: () => void;
}

// A 48px button with one icon and a spoken label, such as the menu button.
export function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}
