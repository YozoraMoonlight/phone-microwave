import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
interface ConnectingSequenceProps {
  // 'create' transmits a D-Mail; 'join' attempts convergence onto an existing worldline.
  mode: 'create' | 'join';
  worldlineId: string;
  labMemberNo: string;
  // Real LiveKit connection state, driven by App.
  ready: boolean; // true once the room is connected + local tracks published
  error: string | null; // set if the connection failed
  onComplete: () => void; // fires only once the scripted log finished AND ready
  onAbort: () => void; // return to the lobby (used on failure)
}
const CREATE_LOG = [
'INITIALIZING FUTURE GADGET LINK...',
'SPOOLING PHONE MICROWAVE (NAME SUBJECT TO CHANGE)...',
'ENCRYPTING D-MAIL PAYLOAD...',
'ROUTING THROUGH SERN RELAYS...',
'ANCHORING WORLDLINE...',
'CHANNEL OPEN.'];

const JOIN_LOG = [
'LOCATING WORLDLINE...',
'SYNCING READING STEINER...',
'ATTEMPTING CONVERGENCE...',
'MATCHING ATTRACTOR FIELD...',
'CONVERGENCE LOCKED.'];

export function ConnectingSequence({
  mode,
  worldlineId,
  labMemberNo,
  ready,
  error,
  onComplete,
  onAbort
}: ConnectingSequenceProps) {
  const log = mode === 'create' ? CREATE_LOG : JOIN_LOG;
  const [visibleLines, setVisibleLines] = useState(0);
  const [scriptDone, setScriptDone] = useState(false);
  const completedRef = useRef(false);
  // Reveal the scripted log line by line, then mark the script finished.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    log.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), i * 650 + 300));
    });
    timers.push(setTimeout(() => setScriptDone(true), log.length * 650 + 500));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Enter the call only once the scripted flavor finished AND the real
  // LiveKit connection is live — so "CONVERGENCE LOCKED" means it truly is.
  useEffect(() => {
    if (scriptDone && ready && !completedRef.current) {
      completedRef.current = true;
      const t = setTimeout(onComplete, 900);
      return () => clearTimeout(t);
    }
  }, [scriptDone, ready, onComplete]);
  const done = scriptDone && !error;
  const waiting = scriptDone && !ready && !error; // script finished, still handshaking
  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
      {/* Header label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="w-2 h-2 bg-[#b06450]" />
        <span className="text-[#a85a45] tracking-[0.3em] text-xs sm:text-sm">
          {mode === 'create' ? 'TRANSMITTING D-MAIL' : 'ATTEMPTING CONVERGENCE'}
        </span>
      </div>

      {/* Worldline readout */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-[10px] text-[#8a7256] tracking-[0.25em] mb-2">
          WORLDLINE
        </span>
        <span className="text-[#a85a45] text-3xl sm:text-4xl tracking-[0.15em]">
          {worldlineId}
        </span>
      </div>

      {/* Status log */}
      <div className="w-full max-w-md border border-[#c2a98a] bg-[#e3dbcb]/80 backdrop-blur-[1px] p-4 min-h-[180px]">
        <div className="text-[10px] text-[#8a7256] tracking-[0.2em] mb-3 pb-2 border-b border-[#c2a98a]">
          LAB MEMBER NO.{labMemberNo} // SECURE // SECURE
        </div>
        <ul className="space-y-1.5">
          {log.slice(0, visibleLines).map((line, i) =>
          <motion.li
            key={line}
            initial={{
              opacity: 0,
              x: -6
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.2
            }}
            className="flex items-center gap-2 text-[11px] sm:text-xs text-[#6b5f4f] tracking-[0.12em]">
            
              <span className="text-[#b06450]">›</span>
              <span>{line}</span>
              {i === visibleLines - 1 && !done &&
            <motion.span
              className="text-[#a85a45]"
              animate={{
                opacity: [1, 0.2, 1]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity
              }}>
              
                  _
                </motion.span>
            }
            </motion.li>
          )}
        </ul>
      </div>

      {/* El Psy Kongroo flash — shown once script done and no error */}
      {done && !waiting &&
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          duration: 0.3
        }}
        className="mt-8 text-[#a85a45] tracking-[0.35em] text-sm sm:text-base">

          EL PSY KONGROO
        </motion.div>
      }

      {/* Script finished but the real link is still handshaking */}
      {waiting &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="mt-8 text-[#8a7256] tracking-[0.3em] text-xs sm:text-sm">

          STABILIZING WORLDLINE...
        </motion.div>
      }

      {/* Convergence failed — real connection error */}
      {error &&
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex flex-col items-center gap-4">

          <div className="flex items-center gap-2 text-[#a85a45] tracking-[0.25em] text-xs sm:text-sm">
            <AlertTriangle size={14} />
            {error}
          </div>
          <button
            onClick={onAbort}
            className="h-10 px-6 border border-[#c2a98a] text-[#6b5f4f] hover:text-[#a85a45] hover:border-[#a85a45] transition-colors tracking-[0.25em] text-xs">

            RETURN TO LOBBY
          </button>
        </motion.div>
      }
    </div>);

}