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
