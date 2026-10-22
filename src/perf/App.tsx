import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { BaseScene } from "../scene/BaseScene";
import { canvasConfig } from "../scene/canvasConfig";
import { hasWebGL2 } from "../scene/hasWebGL2";
import { facingAnticlockwise, onCircle } from "../scene/mataf";
import { OrbitCamera } from "../scene/OrbitCamera";
import { Pilgrim, type PilgrimPose } from "../scene/Pilgrim";
import { HajarAswadLine, HijrWall, MaqamIbrahim } from "../scene/TawafScene";
import { TopCard } from "../ui/TopCard";
import {
  clock,
  meterFrame,
  meterStop,
  startMeter,
  type Reading,
} from "./meter";
import { StressLoad } from "./StressLoad";

interface MeterProps {
  onReading: (r: Reading) => void;
  onDrawn: (text: string) => void;
}

// Feeds every frame time to the meter, and reads the renderer's counts each second.
function PerfMeter({ onReading, onDrawn }: MeterProps) {
  const gl = useThree((s) => s.gl);
  const meter = useRef(startMeter());
  const lastDrawn = useRef(0);

  useEffect(() => {
    const onLost = () => {
      meter.current = meterStop(meter.current, performance.now());
      onReading(meter.current.reading);
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    return () => gl.domElement.removeEventListener("webglcontextlost", onLost);
  }, [gl, onReading]);

  useFrame(() => {
    const now = performance.now();
    const next = meterFrame(meter.current, now);
    if (next.reading !== meter.current.reading) onReading(next.reading);
    meter.current = next;
    const { triangles, calls } = gl.info.render;
    if (next.reading.verdict === "stopped" || calls === 0) return;
    if (now - lastDrawn.current < 1000) return;
    lastDrawn.current = now;
    onDrawn(
      `${triangles.toLocaleString("en-GB")} triangles in ${calls} draw calls`,
    );
  });
  return null;
}

// Walks the tawaf pilgrim anticlockwise round the Kaabah, 16 m out, so /perf draws what /tawaf does (D42).
function WalkingPilgrim() {
  const pose = useRef<PilgrimPose>({
    ...onCircle(16, 0),
    facing: facingAnticlockwise(0),
    stride: 0,
  });
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a = t * 0.12;
    pose.current = {
      ...onCircle(16, a),
      facing: facingAnticlockwise(a),
      stride: Math.sin(t * 5) * 0.5,
    };
  });
  return <Pilgrim pose={pose} />;
}

const check = <path d="M20 6 9 17l-5-5" />;
const circleAlert = (
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </>
);

function Result({ reading }: { reading: Reading }) {
  const { verdict, lowest, elapsedMs } = reading;
  if (verdict === "running") return null;
  const text =
    verdict === "pass"
      ? "Pass. No second dropped below 30 FPS."
      : verdict === "below-30"
        ? `Below 30. The lowest second was ${lowest ?? "–"} FPS.`
        : `Stopped. The browser dropped the 3D view at ${clock(elapsedMs)}.`;
  return (
    <p className={verdict === "pass" ? "result" : "result below"}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {verdict === "pass" ? check : circleAlert}
      </svg>
      <span>{text}</span>
    </p>
  );
}

export function App() {
  const [webgl2] = useState(hasWebGL2);
  const [reading, setReading] = useState(startMeter().reading);
  const [drawn, setDrawn] = useState("–");

  if (!webgl2) {
    return (
      <div className="app" data-state="no-webgl">
        <div className="backdrop" />
        <TopCard
          name="Stress test"
          say={<span>This browser can't show the 3D view.</span>}
          body="Open this link in an up-to-date Chrome or Safari."
        />
      </div>
    );
  }

  return (
    <div className="app" data-state={reading.verdict}>
      <Canvas
        {...canvasConfig}
        camera={{ ...canvasConfig.camera, position: [34, 20, 40] }}
        className="scene"
        tabIndex={0}
        role="img"
        aria-label="Stress scene: columns round the Kaabah, the Hijr Ismail wall, the Maqam Ibrahim, the glowing Hajar Aswad line and one walking pilgrim."
      >
        <BaseScene />
        <StressLoad />
        <HijrWall />
        <MaqamIbrahim />
        <HajarAswadLine hints />
        <WalkingPilgrim />
        <OrbitCamera />
        <PerfMeter onReading={setReading} onDrawn={setDrawn} />
      </Canvas>
      <TopCard name="Stress test">
        <div className="readout">
          <p className="lowest">
            <b>{reading.lowest ?? "–"}</b>
            <span>lowest FPS since the first frame</span>
          </p>
          <dl>
            <dt>Now</dt>
            <dd>{reading.now === null ? "–" : `${reading.now} FPS`}</dd>
            <dt>Time</dt>
            <dd>{clock(reading.elapsedMs)} of 5:00</dd>
            <dt>Drawn</dt>
            <dd data-drawn>{drawn}</dd>
          </dl>
          <Result reading={reading} />
        </div>
      </TopCard>
    </div>
  );
}
