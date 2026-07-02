import React, { useEffect, useRef, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import type { Participant } from 'livekit-client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type Note = { id: string; kind: 'join' | 'leave'; label: string };

// Transient FGL comms notices: announces when a lab member converges onto the
// worldline (joins) or diverges (leaves). Driven by real LiveKit room events;
// each notice self-dismisses after a few seconds.
export function ConvergenceLog() {
  const room = useRoomContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    if (!room) return;

    const push = (kind: Note['kind'], p: Participant) => {
      const label = p.name || p.identity || 'UNKNOWN';
      const id = `${kind}-${p.sid || p.identity}-${seq.current++}`;
      setNotes((n) => [...n, { id, kind, label }]);
      window.setTimeout(
        () => setNotes((n) => n.filter((x) => x.id !== id)),
        4200,
      );
    };

    const onJoin = (p: Participant) => push('join', p);
    const onLeave = (p: Participant) => push('leave', p);
    room.on(RoomEvent.ParticipantConnected, onJoin);
    room.on(RoomEvent.ParticipantDisconnected, onLeave);
    return () => {
      room.off(RoomEvent.ParticipantConnected, onJoin);
      room.off(RoomEvent.ParticipantDisconnected, onLeave);
    };
  }, [room]);

  return (
    <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      <AnimatePresence initial={false}>
        {notes.map((note) => {
          const joining = note.kind === 'join';
          const accent = joining ? '#a85a45' : '#8a7256';
          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex items-center gap-2.5 border bg-[#e3dbcb]/95 backdrop-blur-[1px] px-3 py-1.5 shadow-[2px_2px_0_rgba(58,52,44,0.12)]"
              style={{ borderColor: '#c2a98a' }}>

              <span
                className="flex h-4 w-4 items-center justify-center"
                style={{ color: accent }}>
                {joining ?
                <ArrowDownLeft size={14} strokeWidth={2} /> :
                <ArrowUpRight size={14} strokeWidth={2} />}
              </span>
              <span className="text-[#6b5f4f] text-[10px] sm:text-[11px] tracking-[0.2em]">
                {note.label}
              </span>
              <span
                className="text-[10px] sm:text-[11px] tracking-[0.25em]"
                style={{ color: accent }}>
                {joining ? 'CONVERGED' : 'DIVERGED'}
              </span>
            </motion.div>);

        })}
      </AnimatePresence>
    </div>);

}
