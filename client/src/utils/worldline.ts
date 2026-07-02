// Steins;Gate flavored helpers for the comms link.

// Generate a divergence-number style worldline ID, e.g. "1.048596".
// Integer part is 1–3 (Alpha / Beta / Steins;Gate ranges) so a created
// worldline is always convergeable — see canConverge below.
export function generateWorldlineId(): string {
  const whole = 1 + Math.floor(Math.random() * 3); // 1–3, never below the attractor field
  const frac = Math.floor(Math.random() * 1_000_000).
  toString().
  padStart(6, '0');
  return `${whole}.${frac}`;
}

// Assign a Lab Member No. (001–012).
export function assignLabMemberNo(): string {
  return (Math.floor(Math.random() * 12) + 1).toString().padStart(3, '0');
}

// A worldline "converges" (join succeeds) unless its integer part is 0 —
// a divergence of < 1.0 sits below the Alpha attractor field and is rejected.
export function canConverge(worldlineId: string): boolean {
  const whole = parseInt(worldlineId.split('.')[0] ?? '0', 10);
  return whole >= 1;
}