import { useCallback, useMemo, useState } from 'react';
import { Room, VideoPresets } from 'livekit-client';
import { fetchConnection } from '../lib/livekit';

export type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error';

// Coarse mobile check. We only use it to pick capture orientation, so a
// false positive/negative just changes framing, never correctness.
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// Pick a capture resolution that matches how the device is actually held.
// Phones are used in portrait, so we capture a *native* portrait frame
// (720x1280). That matters for more than shape: a portrait-held phone that
// captures a landscape sensor buffer attaches "rotate 90°" (CVO) metadata,
// which some desktop browsers ignore — that's the sideways-feed bug. A
// native portrait capture needs no rotation, so it's upright everywhere AND
// keeps the tall phone aspect. Desktops stay landscape 720p.
function captureResolution() {
  const base = VideoPresets.h720.resolution;
  if (isMobileDevice()) {
    return { ...base, width: base.height, height: base.width }; // 720x1280
  }
  return base; // 1280x720
}

// Owns the LiveKit Room lifecycle for the comms link.
// The Room instance is stable for the app's lifetime; connect/disconnect
// drive it. Camera + mic are published on connect (call starts live).
export function useRoomConnection() {
  const room = useMemo(
    () =>
      new Room({
        adaptiveStream: true, // scale incoming video to the tile size
        dynacast: true, // stop sending layers no one is viewing
        // Orientation-aware capture (see captureResolution above): portrait
        // on phones so the feed is natively upright and keeps its tall shape,
        // landscape on desktop. Also bumps quality from the ~540p default.
        videoCaptureDefaults: {
          resolution: captureResolution(),
        },
        // Clean up the audio path — these aren't reliably on by default.
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        publishDefaults: {
          // Give the top layer real headroom so 720p actually looks like 720p.
          videoEncoding: {
            maxBitrate: 2_500_000,
            maxFramerate: 30,
          },
          // Simulcast so we can still serve smaller tiles cheaply.
          videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
          red: true, // redundant audio packets → resilient to loss
          dtx: true, // don't transmit during silence → saves bandwidth
        },
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
