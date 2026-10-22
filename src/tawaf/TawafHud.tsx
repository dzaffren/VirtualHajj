import { useState } from "react";
import { arabic, copy, type Copy, type Lang } from "../copy";
import { DoaBlock } from "../ui/DoaBlock";
import { HintsSwitch } from "../ui/HintsSwitch";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";
import { LanguageChoice } from "../ui/LanguageChoice";
import { PrimaryButton } from "../ui/PrimaryButton";
import { ProgressMarks } from "../ui/ProgressMarks";
import { QuietButton } from "../ui/QuietButton";
import { Sheet } from "../ui/Sheet";
import { StationSheet } from "../ui/StationSheet";
import { Toast } from "../ui/Toast";
import { TopCard } from "../ui/TopCard";
import {
  countedRounds,
  type HudView,
  type Mistake,
  type Side,
} from "./hudView";

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
  onStartRound?: () => void;
  onShowMe?: () => void;
  onFinish?: () => void;
  onTurnToSpot?: () => void;
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
  const done = useLeaving(view.phase === "done" ? view : null);
  const station = useLeaving(
    view.phase === "rakaat" || (view.phase === "istilam" && !view.demo)
      ? view.phase
      : null,
  );

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

  // The pilgrim stands still at a station, and the tawaf is over on the done card.
  const walking =
    view.phase !== "done" &&
    view.phase !== "istilam" &&
    view.phase !== "rakaat";
  const afterRounds = view.phase === "to-maqam";
  return (
    <>
      {/* While a sheet is open, the controls behind its scrim take no focus or clicks. */}
      <div inert={Boolean(done.shown || menu.shown)}>
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
            {afterRounds ? (
              <PrimaryButton onClick={props.onFinish}>
                {t.finishTawaf}
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={props.onDone}>{t.done}</PrimaryButton>
            )}
          </div>
        )}
        {afterRounds && !hints && (
          <Toast
            icon={view.over ? "circle-alert" : "check"}
            mistake={!!view.over}
          >
            {view.over ? t.listOver(view.over) : t.sevenCount}
          </Toast>
        )}
        {hints && view.phase === "before-line" && (
          <EdgeArrow
            side={view.lineOffScreen}
            name={t.lineName}
            label={t.turnToLine}
            onClick={props.onTurnToLine}
          />
        )}
        {hints && afterRounds && (
          <EdgeArrow
            side={view.spotOffScreen}
            name={t.maqamName}
            label={t.turnToMaqam}
            onClick={props.onTurnToSpot}
          />
        )}
      </div>
      {station.shown === "istilam" && (
        <StationSheet
          station={t.stationStart}
          title={t.istilamTitle}
          arabicName={arabic.hajarAswad}
          titleId="station-title"
          leaving={station.leaving}
          onGone={station.onGone}
        >
          <p className="station-body">{t.istilamBody}</p>
          <DoaBlock
            doa={arabic.istilam.doa}
            reading={arabic.istilam.reading}
            meaning={t.istilamMeaning}
          />
          <p className="sheet-note">{t.istilamThen}</p>
          <div className="station-actions">
            <PrimaryButton onClick={props.onStartRound}>
              {t.startRound1}
            </PrimaryButton>
            <QuietButton onClick={props.onShowMe}>{t.showMeHow}</QuietButton>
          </div>
        </StationSheet>
      )}
      {station.shown === "rakaat" && (
        <StationSheet
          station={t.stationAfter}
          title={t.rakaatTitle}
          arabicName={arabic.maqamIbrahim}
          titleId="station-title"
          leaving={station.leaving}
          onGone={station.onGone}
        >
          <p className="station-body">{t.rakaatBody}</p>
          <div className="rakaat">
            <p>{t.rakaatFirst}</p>
            <p>{t.rakaatSecond}</p>
          </div>
          <p className="sheet-note">{t.rakaatCrowd}</p>
          <div className="station-actions">
            <PrimaryButton onClick={props.onFinish}>
              {t.finishTawaf}
            </PrimaryButton>
          </div>
        </StationSheet>
      )}
      {done.shown && (
        <DoneSheet
          mistakes={done.shown.mistakes}
          prayed={done.shown.prayed ?? true}
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
  let lead: string, say: string;
  let note: string | null = null;
  let doa = false;
  let mistake = false;
  switch (view.phase) {
    case "before-line":
      if (!hints) return null;
      [lead, say, note] = [t.beforeLead, t.beforeSay, t.beforeBody];
      break;
    case "round":
      if (!hints) return null;
      lead = t.roundOf(view.round);
      if (view.part === "istilam") [say, note] = [t.istilamSay, t.istilamNote];
      else if (view.part === "doa") [say, doa] = [t.doaSay, true];
      else [say, note] = [t.roundSay, t.roundBody(view.round)];
      break;
    case "to-maqam":
      if (!hints) return null;
      [lead, say, note] = [t.roundsDone, t.toMaqamSay, t.toMaqamNote];
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
  const part = "kind" in view ? view.kind : "part" in view ? view.part : "";
  const step = `${view.phase}-${counted}-${part}`;
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
            walking={view.phase !== "before-line" && view.phase !== "to-maqam"}
          />
        )}
      </div>
      <h1 className="card-say step" key={`say-${step}`}>
        {say}
      </h1>
      {doa && (
        <div className="step" key={`doa-${step}`}>
          <DoaBlock
            doa={arabic.rabbana.doa}
            reading={arabic.rabbana.reading}
            meaning={t.rabbanaMeaning}
          />
        </div>
      )}
      {note && (
        <p className="card-note step" key={`note-${step}`}>
          {note}
        </p>
      )}
    </section>
  );
}

// Points to the next target while the camera can't see it. A tap turns the pilgrim towards it.
function EdgeArrow({
  side,
  name,
  label,
  onClick,
}: {
  side: Side;
  name: string;
  label: string;
  onClick?: () => void;
}) {
  if (!side) return null;
  return (
    <button
      type="button"
      className={`edge-arrow edge-${side}`}
      aria-label={label}
      onClick={onClick}
    >
      {side === "left" && <Icon name="arrow-left" />}
      <span>{name}</span>
      {side === "right" && <Icon name="arrow-right" />}
    </button>
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
  prayed,
  leaving,
  onGone,
  t,
  onStartAgain,
  onBack,
}: { mistakes: Mistake[]; prayed: boolean } & SheetPart & TawafHudProps) {
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
      {!prayed && (
        <p className="done-note">
          <Icon name="info" />
          <span>{t.noRakaat}</span>
        </p>
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
