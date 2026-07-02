import React, { useEffect, useMemo, useState } from 'react';
import { useRoomContext, useParticipants } from '@livekit/components-react';

// Shared elapsed timer. Instead of counting from when *you* joined (which
// differs per person), it counts from the earliest participant join time in
// the room — i.e. when the worldline was opened. `joinedAt` is server-assigned
// and identical for everyone, so all clients show the same elapsed value.
export function DivergenceTimer() {
  const room = useRoomContext();
  const participants = useParticipants();

  // Earliest join across everyone currently in the room (ms since epoch).
  const anchor = useMemo(() => {
    const times = participants.
    map((p) => p.joinedAt?.getTime()).
    filter((t): t is number => typeof t === 'number' && t > 0);
    if (times.length === 0) {
      // Fallback before join times are known: our own local join.
      return room?.localParticipant?.joinedAt?.getTime() ?? Date.now();
    }
    return Math.min(...times);
  }, [participants, room]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = Math.max(0, Math.floor((now - anchor) / 1000));
  const h = Math.floor(time / 3600);
  const m = Math.floor(time % 3600 / 60);
  const s = time % 60;
  const timeString = `${h}.${m.toString().padStart(2, '0')}${s.toString().padStart(2, '0')}`;
  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <span className="hidden sm:inline text-[10px] text-[#8a7256] tracking-[0.25em] uppercase">
        Elapsed
      </span>
      <div className="flex items-stretch gap-px border border-[#c2a98a]">
        {timeString.split('').map((char, i) =>
        char === '.' ?
        <span
          key={i}
          className="flex items-end justify-center px-1 pb-1 text-[#a85a45] text-xl sm:text-2xl leading-none bg-[#e3dbcb]">

              .
            </span> :

        <span
          key={i}
          className="flex items-center justify-center w-5 h-8 sm:w-6 sm:h-9 text-[#a85a45] text-xl sm:text-2xl leading-none bg-[#e3dbcb]">

              {char}
            </span>

        )}
      </div>
    </div>);

}
