// What the HUD shows. The tawaf state turns into one of these; the HUD only draws it.
export type MistakeKind = "wrong-way" | "hijr";

export type Mistake =
  | { kind: MistakeKind; round: number }
  | { kind: "early"; counted: number }
  | { kind: "over"; walked: number };

export type HudView =
  | { phase: "loading" | "no-webgl" | "stopped" }
  | { phase: "before-line"; lineOffScreen: "left" | "right" | null }
  | { phase: "round"; round: number }
  | { phase: "void"; round: number; kind: MistakeKind }
  | { phase: "short"; counted: number }
  | { phase: "done"; mistakes: Mistake[] };

export function countedRounds(view: HudView): number {
  switch (view.phase) {
    case "round":
    case "void":
      return view.round - 1;
    case "short":
      return view.counted;
    case "done":
      return 7;
    default:
      return 0;
  }
}
