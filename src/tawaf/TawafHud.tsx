import { useState } from "react";
import { copy, type Copy, type Lang } from "../copy";
import { HintsSwitch } from "../ui/HintsSwitch";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";
import { LanguageChoice } from "../ui/LanguageChoice";
import { PrimaryButton } from "../ui/PrimaryButton";
import { ProgressMarks } from "../ui/ProgressMarks";
import { QuietButton } from "../ui/QuietButton";
import { Sheet } from "../ui/Sheet";
import { TopCard } from "../ui/TopCard";
import { countedRounds, type HudView, type Mistake } from "./hudView";

export interface TawafHudProps {
  view: HudView;
  hints: boolean;
  lang: Lang;
  menuOpen: boolean;
  onHints: (on: boolean) => void;
  onLang: (lang: Lang) => void;
  onMenu: (open: boolean) => void;
  onDone: () => void;
  onStartAgain: () => void;
  onBack: () => void;
  onTurnToLine: () => void;
  onReload: () => void;
}

// Keeps a sheet's last content on screen while it leaves.
function useLeaving<T>(value: T | null) {
  const [kept, setKept] = useState(value);
  if (value !== null && value !== kept) setKept(value);
  return {
    shown: value ?? kept,
    leaving: value === null && kept !== null,
    onGone: () => setKept(null),
  };
}

// The walking HUD for /tawaf: top bar, top card, corner controls, and the two sheets.
export function TawafHud(props: TawafHudProps) {
  const { view, hints, lang } = props;
  const t = copy[lang];
  const menu = useLeaving(props.menuOpen ? true : null);
  const done = useLeaving(view.phase === "done" ? view.mistakes : null);

  if (view.phase === "loading")
    return <TopCard name={t.tawaf} say={<span>{t.loading}</span>} />;
  if (view.phase === "no-webgl")
    return (
      <TopCard
        name={t.tawaf}
        say={<span>{t.noWebgl}</span>}
        body={t.noWebglNext}
      />
    );
  if (view.phase === "stopped")
    return (
      <TopCard
        name={t.tawaf}
        say={<span>{t.stopped}</span>}
        body={t.stoppedNext}
        action={
          <PrimaryButton onClick={props.onReload}>{t.reload}</PrimaryButton>
        }
      />
    );

  const walking = view.phase !== "done";
  return (
    <>
      <div className="top-bar">
        <HintsSwitch
          label={t.hints}
          on={hints}
          onWord={t.on}
          offWord={t.off}
          onChange={props.onHints}
        />
        <IconButton
          icon="menu"
          label={t.menu}
          onClick={() => props.onMenu(true)}
        />
      </div>
      <Card view={view} hints={hints} t={t} />
      {walking && hints && view.phase !== "short" && (
        <p className="caption-chip corner corner-left">
          <span className="hint-touch">{t.walkTouch}</span>
          <span className="hint-mouse">{t.walkMouse}</span>
        </p>
      )}
      {walking && !hints && (
        <div className="corner corner-right">
          <PrimaryButton onClick={props.onDone}>{t.done}</PrimaryButton>
        </div>
      )}
      {hints && view.phase === "before-line" && view.lineOffScreen && (
        <button
          type="button"
          className={`edge-arrow edge-${view.lineOffScreen}`}
          aria-label={t.turnToLine}
          onClick={props.onTurnToLine}
        >
          {view.lineOffScreen === "left" && <Icon name="arrow-left" />}
          <span>{t.lineName}</span>
          {view.lineOffScreen === "right" && <Icon name="arrow-right" />}
        </button>
      )}
      {done.shown && (
        <DoneSheet
          mistakes={done.shown}
          leaving={done.leaving}
          onGone={done.onGone}
          t={t}
          {...props}
        />
      )}
      {menu.shown && (
        <MenuSheet
          leaving={menu.leaving}
          onGone={menu.onGone}
          t={t}
          {...props}
        />
      )}
    </>
  );
}

function Card({ view, hints, t }: { view: HudView; hints: boolean; t: Copy }) {
  const counted = countedRounds(view);
  let lead: string, say: string, note: string;
  let mistake = false;
  switch (view.phase) {
    case "before-line":
      if (!hints) return null;
      [lead, say, note] = [t.beforeLead, t.beforeSay, t.beforeBody];
      break;
    case "round":
      if (!hints) return null;
      [lead, say, note] = [
        t.roundOf(view.round),
        t.roundSay,
        t.roundBody(view.round),
      ];
      break;
    case "void":
      mistake = true;
      lead = t.notCounted;
      say = view.kind === "hijr" ? t.hijrSay : t.wrongWaySay;
      note = `${view.kind === "hijr" ? t.hijrWhy : t.wrongWayWhy} ${t.restartBody(hints ? view.round : null)}`;
      break;
    case "short":
      mistake = true;
      [lead, say, note] = [
        t.notDoneLead,
        t.shortSay(view.counted),
        t.shortBody(view.counted),
      ];
      break;
    default:
      return null;
  }
  const step = `${view.phase}-${counted}-${"kind" in view ? view.kind : ""}`;
  return (
    <section
      className={mistake ? "card below-bar card-mistake" : "card below-bar"}
      aria-live="polite"
    >
      <div className="card-lead-row">
        <p className="card-lead step" key={`lead-${step}`}>
          {mistake && <Icon name="circle-alert" />}
          <span>{lead}</span>
        </p>
        {hints && view.phase !== "short" && (
          <ProgressMarks
            counted={counted}
            walking={view.phase !== "before-line"}
          />
        )}
      </div>
      <h1 className="card-say step" key={`say-${step}`}>
        {say}
      </h1>
      <p className="card-note step" key={`note-${step}`}>
        {note}
      </p>
    </section>
  );
}

function mistakeLine(m: Mistake, t: Copy) {
  switch (m.kind) {
    case "wrong-way":
      return t.listWrongWay(m.round);
    case "hijr":
      return t.listHijr(m.round);
    case "early":
      return t.listEarly(m.counted);
    case "over":
      return t.listOver(m.walked);
  }
}

interface SheetPart {
  leaving: boolean;
  onGone: () => void;
  t: Copy;
}

function DoneSheet({
  mistakes,
  leaving,
  onGone,
  t,
  onStartAgain,
  onBack,
}: { mistakes: Mistake[] } & SheetPart & TawafHudProps) {
  return (
    <Sheet titleId="done-title" leaving={leaving} onGone={onGone}>
      <h2 className="sheet-title" id="done-title">
        <Icon name="check" />
        <span>{t.doneTitle}</span>
      </h2>
      {mistakes.length === 0 ? (
        <p className="sheet-note">{t.noMistakes}</p>
      ) : (
        <div className="sheet-group">
          <p className="sheet-label">{t.onTheWay}</p>
          <ul className="mistake-list">
            {mistakes.map((m, i) => (
              <li key={i}>
                <Icon name="circle-alert" />
                <span>{mistakeLine(m, t)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="sheet-group">
        <PrimaryButton onClick={onStartAgain}>{t.walkAgain}</PrimaryButton>
        <QuietButton onClick={onBack}>{t.backToViewer}</QuietButton>
      </div>
    </Sheet>
  );
}

function MenuSheet({
  leaving,
  onGone,
  t,
  ...props
}: SheetPart & TawafHudProps) {
  const { view, hints } = props;
  const sub =
    hints && (view.phase === "round" || view.phase === "void")
      ? `${t.roundOf(view.round)} · ${t.paused}`
      : t.paused;
  return (
    <Sheet
      titleId="menu-title"
      leaving={leaving}
      onGone={onGone}
      onClose={() => props.onMenu(false)}
    >
      <div className="sheet-head">
        <div>
          <h2 className="sheet-title" id="menu-title">
            {t.tawaf}
          </h2>
          <p className="sheet-sub">{sub}</p>
        </div>
        <IconButton
          icon="x"
          label={t.closeMenu}
          onClick={() => props.onMenu(false)}
        />
      </div>
      <div className="sheet-group">
        <p className="sheet-label">{t.language}</p>
        <LanguageChoice
          label={t.language}
          lang={props.lang}
          onChange={props.onLang}
        />
      </div>
      <HintsSwitch
        label={t.hints}
        on={hints}
        onWord={t.on}
        offWord={t.off}
        onChange={props.onHints}
      />
      <div className="sheet-group">
        <PrimaryButton onClick={() => props.onMenu(false)}>
          {t.carryOn}
        </PrimaryButton>
        <QuietButton onClick={props.onStartAgain}>{t.startAgain}</QuietButton>
        <QuietButton onClick={props.onBack}>{t.backToViewer}</QuietButton>
      </div>
    </Sheet>
  );
}
