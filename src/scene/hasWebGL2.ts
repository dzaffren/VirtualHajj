export function hasWebGL2(): boolean {
  return document.createElement("canvas").getContext("webgl2") !== null;
}
