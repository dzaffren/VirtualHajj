import { useMediaQuery } from "./useMediaQuery";

// The scene palette (D25). It lives outside the UI design system.
const cloth = {
  kiswah: "#171513",
  kiswahBand: "#C9A24A",
  ihram: "#F7F5F0",
  skin: "#A8754F",
  hair: "#3B2A20",
  stoneFrame: "#C9CDD2",
};

export const palette = {
  day: {
    sky: "#BFE3F5",
    ground: "#ECE6DC",
    hijrWall: "#F7F3EA",
    lineMark: "#BCA78A",
    shadow: "#2A1F14",
    hemisphere: 1.6,
    sun: 2.4,
    ...cloth,
  },
  night: {
    sky: "#2E405A",
    ground: "#46546A",
    hijrWall: "#5A6880",
    lineMark: "#2F3B4E",
    shadow: "#000000",
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
