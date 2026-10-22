export type ViewerState = "loading" | "ready" | "no-webgl" | "stopped";
export type ViewerEvent = "first-frame" | "no-webgl" | "context-lost";

export function viewerState(
  state: ViewerState,
  event: ViewerEvent,
): ViewerState {
  if (state === "loading" && event === "first-frame") return "ready";
  if (state === "loading" && event === "no-webgl") return "no-webgl";
  if ((state === "loading" || state === "ready") && event === "context-lost")
    return "stopped";
  return state;
}
