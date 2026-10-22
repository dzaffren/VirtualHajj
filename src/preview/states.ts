import { facingAnticlockwise, lineAngle, onCircle } from "../scene/mataf";
import type { PilgrimPose } from "../scene/TawafScene";
import type { HudView } from "../tawaf/hudView";

export interface PreviewState {
  id: string;
  group: string;
  label: string;
  scenario: string;
  page: "viewer" | "tawaf";
  view: HudView;
  hints: boolean;
  menuOpen?: boolean;
  pose: PilgrimPose;
  tap?: boolean;
}

const r = 16;
const at = (angle: number, stride: number, wrongWay = false): PilgrimPose => ({
  ...onCircle(r, angle),
  facing: facingAnticlockwise(angle) + (wrongWay ? Math.PI : 0),
  stride,
});
const approaching = at(lineAngle - 0.5, 0.35);
const insideHijr: PilgrimPose = {
  x: 1.5,
  z: -9.5,
  facing: facingAnticlockwise(Math.atan2(9.5, 1.5)),
  stride: 0.35,
};

const wrongWayRound3 = { kind: "wrong-way", round: 3 } as const;
const hijrRound5 = { kind: "hijr", round: 5 } as const;

export const states: PreviewState[] = [
  {
    id: "viewer",
    group: "Viewer at /",
    label: "Ready, with Start tawaf",
    scenario: "1",
    page: "viewer",
    view: { phase: "round", round: 1 },
    hints: true,
    pose: at(0, 0),
  },
  {
    id: "before",
    group: "Hints on",
    label: "Before the line",
    scenario: "1",
    page: "tawaf",
    view: { phase: "before-line", lineOffScreen: null },
    hints: true,
    pose: at(lineAngle - 0.45, 0.35),
  },
  {
    id: "before-away",
    group: "Hints on",
    label: "Before the line, the line out of sight: edge arrow",
    scenario: "1",
    page: "tawaf",
    view: { phase: "before-line", lineOffScreen: "left" },
    hints: true,
    pose: at(lineAngle + 2.4, 0.35),
  },
  {
    id: "round3",
    group: "Hints on",
    label: "Round 3 of 7, with a tap ring",
    scenario: "1",
    page: "tawaf",
    view: { phase: "round", round: 3 },
    hints: true,
    pose: approaching,
    tap: true,
  },
  {
    id: "round7",
    group: "Hints on",
    label: "Round 7 of 7",
    scenario: "1",
    page: "tawaf",
    view: { phase: "round", round: 7 },
    hints: true,
    pose: approaching,
  },
  {
    id: "wrong-way",
    group: "Hints on",
    label: "Mistake: the wrong way",
    scenario: "2",
    page: "tawaf",
    view: { phase: "void", round: 3, kind: "wrong-way" },
    hints: true,
    pose: at(1.2, 0.35, true),
  },
  {
    id: "hijr",
    group: "Hints on",
    label: "Mistake: inside the Hijr Ismail",
    scenario: "2",
    page: "tawaf",
    view: { phase: "void", round: 3, kind: "hijr" },
    hints: true,
    pose: insideHijr,
  },
  {
    id: "menu",
    group: "Hints on",
    label: "Menu open",
    scenario: "4",
    page: "tawaf",
    view: { phase: "round", round: 2 },
    hints: true,
    menuOpen: true,
    pose: approaching,
  },
  {
    id: "off-walk",
    group: "Hints off",
    label: "Walking",
    scenario: "3",
    page: "tawaf",
    view: { phase: "round", round: 4 },
    hints: false,
    pose: at(2.6, 0.35),
  },
  {
    id: "off-wrong-way",
    group: "Hints off",
    label: "Mistake named, no count shown",
    scenario: "3",
    page: "tawaf",
    view: { phase: "void", round: 4, kind: "wrong-way" },
    hints: false,
    pose: at(2.6, 0.35, true),
  },
  {
    id: "off-short",
    group: "Hints off",
    label: "Done after six rounds",
    scenario: "3",
    page: "tawaf",
    view: { phase: "short", counted: 6 },
    hints: false,
    pose: at(lineAngle + 0.12, 0),
  },
  {
    id: "done-clean",
    group: "Done",
    label: "Seven clean rounds",
    scenario: "1, 3",
    page: "tawaf",
    view: { phase: "done", mistakes: [] },
    hints: true,
    pose: at(lineAngle + 0.05, 0),
  },
  {
    id: "done-mistakes",
    group: "Done",
    label: "Mistakes listed",
    scenario: "2, 3",
    page: "tawaf",
    view: {
      phase: "done",
      mistakes: [wrongWayRound3, hijrRound5, { kind: "early", counted: 6 }],
    },
    hints: false,
    pose: at(lineAngle + 0.05, 0),
  },
  {
    id: "done-over",
    group: "Done",
    label: "Done after eight rounds",
    scenario: "3",
    page: "tawaf",
    view: { phase: "done", mistakes: [{ kind: "over", walked: 8 }] },
    hints: false,
    pose: at(lineAngle + 0.05, 0),
  },
  {
    id: "loading",
    group: "Can't show the 3D view",
    label: "Loading",
    scenario: "5",
    page: "tawaf",
    view: { phase: "loading" },
    hints: true,
    pose: approaching,
  },
  {
    id: "no-webgl",
    group: "Can't show the 3D view",
    label: "No WebGL 2",
    scenario: "5",
    page: "tawaf",
    view: { phase: "no-webgl" },
    hints: true,
    pose: approaching,
  },
  {
    id: "stopped",
    group: "Can't show the 3D view",
    label: "The 3D view stopped",
    scenario: "5",
    page: "tawaf",
    view: { phase: "stopped" },
    hints: true,
    pose: approaching,
  },
];

export function stateById(id: string | null): PreviewState {
  return states.find((s) => s.id === id) ?? states[1];
}
