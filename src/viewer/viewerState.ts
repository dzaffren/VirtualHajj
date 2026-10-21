export type ViewerState = "loading" | "ready";
export type ViewerEvent = "first-frame";

export function viewerState(
  state: ViewerState,
  event: ViewerEvent,
): ViewerState {
  if (state === "loading" && event === "first-frame") return "ready";
  return state;
}
