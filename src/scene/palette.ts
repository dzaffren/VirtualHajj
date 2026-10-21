import { useMediaQuery } from "./useMediaQuery";

// The scene palette (D25). It lives outside the UI design system.
const cloth = {
  kiswah: "#171513",
  kiswahBand: "#C9A24A",
  ihram: "#F7F5F0",
};

export const palette = {
  day: {
    sky: "#BFE3F5",
    ground: "#ECE6DC",
    hemisphere: 1.6,
    sun: 2.4,
    ...cloth,
  },
  night: {
    sky: "#2E405A",
    ground: "#46546A",
    hemisphere: 1.1,
    sun: 1.4,
    ...cloth,
  },
};

export function useScenePalette() {
  return palette[
    useMediaQuery("(prefers-color-scheme: dark)") ? "night" : "day"
  ];
}
