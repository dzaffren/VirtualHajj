// The mataf in metres, with the Kaabah at the origin. An angle runs anticlockwise seen from above, from +x towards -z, so tawaf walks the angle up.

// The Hajar Aswad corner. Tawaf passes it last of the four, so the Rukun Yamani comes just before it.
export const hajarAswad = { x: 5.5, z: 6 };
export const lineAngle = Math.atan2(-hajarAswad.z, hajarAswad.x);
export const lineLength = 22;

// The Hijr Ismail wall: a low arc off the face between the Rukun Iraqi and the Rukun Shami, with a gap at each end.
export const hijr = {
  faceZ: -6,
  radius: 6.5,
  halfSpan: (70 * Math.PI) / 180,
  thickness: 0.6,
  height: 1.3,
};

export function onCircle(r: number, angle: number) {
  return { x: r * Math.cos(angle), z: -r * Math.sin(angle) };
}

// The figure's turn about y, for a model that faces +z.
export function facingAnticlockwise(angle: number) {
  return Math.atan2(-Math.sin(angle), -Math.cos(angle));
}

// Inside the Hijr Ismail: past the Kaabah's face, and nearer the arc's centre than the wall's inner face.
export function insideHijr(x: number, z: number) {
  return (
    z < hijr.faceZ &&
    Math.hypot(x, z - hijr.faceZ) < hijr.radius - hijr.thickness / 2
  );
}

// The walking limits: the Kaabah's 11 x 12 m footprint as half sizes, how close the pilgrim's centre comes to a wall, and how far out the mataf goes.
export const kaabah = { halfX: 5.5, halfZ: 6 };
export const body = 0.4;
export const edge = 30;

// The point on the Hajar Aswad line as far out as a spot, for turning towards the line.
export function onLine(x: number, z: number) {
  const corner = Math.hypot(hajarAswad.x, hajarAswad.z);
  const out = Math.min(Math.max(Math.hypot(x, z), corner), corner + lineLength);
  return onCircle(out, lineAngle);
}

// The Maqam Ibrahim stands about 10.5 m out from the door face, in front of the door, near the Hajar Aswad corner.
// The spot for the two rakaat is 3 m further out, on the line from the Kaabah through the Maqam; within 3 m of it counts (O6).
export const maqam = { x: 16, z: 2.5, radius: 0.9 };
export const maqamSpot = { x: maqam.x + 3, z: maqam.z, radius: 3 };
// The corner tawaf passes just before the Hajar Aswad.
export const rukunYamani = { x: -hajarAswad.x, z: hajarAswad.z };
