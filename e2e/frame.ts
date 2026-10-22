import { PNG } from "pngjs";

// Counts the distinct colours in the lower half of a PNG screenshot.
export function lowerHalfColours(screenshot: Buffer): number {
  const { width, height, data } = PNG.sync.read(screenshot);
  const colours = new Set<number>();
  for (let y = Math.floor(height / 2); y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      colours.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    }
  }
  return colours.size;
}
