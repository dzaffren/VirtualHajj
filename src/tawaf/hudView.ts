// What the HUD shows. The tawaf state turns into one of these; the HUD only draws it.
export type MistakeKind = "wrong-way" | "hijr";

export type Mistake =
  | { kind: MistakeKind; round: number }
  | { kind: "early"; counted: number }
  | { kind: "over"; walked: number };

// The part of a round the pilgrim walks, with hints on: the istilam reminder after the line, then the walk, then the doa from the Rukun Yamani.
export type RoundPart = "istilam" | "walk" | "doa";

export type Side = "left" | "right" | null;

export type HudView =
  | { phase: "loading" | "no-webgl" | "stopped" }
  | { phase: "before-line"; lineOffScreen: Side }
  | { phase: "istilam"; demo: boolean }
  | { phase: "round"; round: number; part?: RoundPart }
  | { phase: "void"; round: number; kind: MistakeKind }
  | { phase: "short"; counted: number }
  | {
      phase: "to-maqam";
      atLine: boolean;
      spotOffScreen: Side;
      over: number | null;
    }
  | { phase: "rakaat" }
  | { phase: "done"; mistakes: Mistake[]; prayed?: boolean };

export function countedRounds(view: HudView): number {
  switch (view.phase) {
    case "round":
    case "void":
      return view.round - 1;
    case "short":
      return view.counted;
    case "to-maqam":
    case "rakaat":
    case "done":
      return 7;
    default:
      return 0;
  }
}
