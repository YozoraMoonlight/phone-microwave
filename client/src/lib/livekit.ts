// Central config + token fetch for the FGL comms link (LiveKit under the hood).

// The SFU URL the browser connects to. The token backend also returns this,
// but we keep a default here for clarity. Override via VITE_LIVEKIT_URL if needed.
export const LIVEKIT_URL =
  (import.meta as any).env?.VITE_LIVEKIT_URL ?? 'ws://localhost:7880';

export interface Connection {
  token: string;
  url: string;
}

// Ask the token backend for a join token.
//   worldlineId -> room name
//   labMemberNo -> baked into a unique participant identity
export async function fetchConnection(
  worldlineId: string,
  labMemberNo: string,
): Promise<Connection> {
  // identity must be unique per participant; suffix keeps two tabs from colliding.
  const suffix = Math.floor(Math.random() * 1e4).toString().padStart(4, '0');
  const identity = `lab-${labMemberNo}-${suffix}`;
  const name = `LAB MEMBER NO.${labMemberNo}`;

  const params = new URLSearchParams({ room: worldlineId, identity, name });
  const res = await fetch(`/token?${params.toString()}`);
  if (!res.ok) {
    let msg = 'CONVERGENCE FAILED';
    try {
      msg = (await res.json()).error ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as Connection;
  return { token: data.token, url: data.url ?? LIVEKIT_URL };
}
