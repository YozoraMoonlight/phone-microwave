import { useCallback, useMemo, useState } from 'react';
import { Room } from 'livekit-client';
import { fetchConnection } from '../lib/livekit';

export type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

// Owns the LiveKit Room lifecycle for the comms link.
// The Room instance is stable for the app's lifetime; connect/disconnect
// drive it. Camera + mic are published on connect (call starts live).
export function useRoomConnection() {
  const room = useMemo(
    () =>
      new Room({
        adaptiveStream: true, // scale incoming video to the tile size
        dynacast: true, // stop sending layers no one is viewing
      }),
    [],
  );

  const [status, setStatus] = useState<ConnStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    async (worldlineId: string, labMemberNo: string) => {
      setError(null);
      setStatus('connecting');
      try {
        const { token, url } = await fetchConnection(worldlineId, labMemberNo);
        await room.connect(url, token);
        // Publish local camera + mic — the call opens live.
        await room.localParticipant.enableCameraAndMicrophone();
        setStatus('connected');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'CONVERGENCE FAILED';
        setError(msg);
        setStatus('error');
        // Best-effort cleanup so a retry starts clean.
        try {
          await room.disconnect();
        } catch {
          /* ignore */
        }
      }
    },
    [room],
  );

  const disconnect = useCallback(async () => {
    try {
      await room.disconnect();
    } catch {
      /* ignore */
    }
    setStatus('idle');
    setError(null);
  }, [room]);

  return { room, status, error, connect, disconnect };
}
