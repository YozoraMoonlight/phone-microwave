import React from 'react';
import { User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useTracks,
  useLocalParticipant,
  VideoTrack,
  isTrackReference } from
'@livekit/components-react';
import { Track } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';

// One themed video tile — bordered frame, SUBJECT tag, NO-SIGNAL fallback.
function SubjectTile({
  trackRef,
  index,
  isLocal = false
}: {
  trackRef: TrackReferenceOrPlaceholder;
  index: number;
  isLocal?: boolean;
}) {
  const p = trackRef.participant;
  // A real, subscribed camera track that isn't muted → show video.
  const hasVideo =
    isTrackReference(trackRef) &&
    trackRef.publication?.isSubscribed !== false &&
    !trackRef.publication?.isMuted;
  const tag = `SUBJECT_${(index + 1).toString().padStart(3, '0')}`;
  const label = isLocal ? 'YOU' : p?.name || p?.identity || 'UNKNOWN';
  return (
    <div className="relative w-full h-full min-h-0 border border-[#c2a98a] bg-[#e3dbcb]/70 backdrop-blur-[1px] overflow-hidden flex items-center justify-center">
      {hasVideo ?
      <VideoTrack
        trackRef={trackRef as any}
        // mirror your own feed like every video app does
        className="w-full h-full object-cover"
        style={isLocal ? { transform: 'scaleX(-1)' } : undefined} /> :

      <div className="flex flex-col items-center text-center px-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 border border-[#c2a98a] bg-[#ece5d7] flex items-center justify-center mb-3 sm:mb-4">
            <User
            size={40}
            className="text-[#a89479]"
            strokeWidth={1.25} />

          </div>
          <div className="text-[#6b5f4f] tracking-[0.3em] text-[10px] sm:text-xs">
            {isLocal ? 'CAM OFFLINE' : 'NO SIGNAL'}
          </div>
        </div>
      }

      {/* Top-left subject tag */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#b06450]" />
        <span className="text-[#a85a45] text-[10px] sm:text-[11px] tracking-[0.2em]">
          {tag}
        </span>
      </div>

      {/* Bottom-left participant label */}
      <div className="absolute bottom-3 left-3 bg-[#ece5d7]/90 border border-[#c2a98a] px-2 py-0.5 text-[#6b5f4f] text-[9px] sm:text-[10px] tracking-[0.2em]">
        {label}
      </div>
    </div>);

}

export function ParticipantView() {
  const { localParticipant } = useLocalParticipant();

  // All camera tracks in the room, with placeholders so a participant with
  // their camera off still gets a tile.
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const remoteTracks = tracks.filter(
    (t) => t.participant?.identity !== localParticipant?.identity
  );
  const localTrack = tracks.find(
    (t) => t.participant?.identity === localParticipant?.identity
  );

  const remoteCount = remoteTracks.length;
  // Choose a column count that keeps tiles roughly square as people join.
  const cols =
  remoteCount <= 1 ? 1 : remoteCount <= 4 ? 2 : remoteCount <= 9 ? 3 : 4;

  return (
    <div className="relative z-10 w-full h-full flex-1 overflow-hidden p-3 sm:p-4">
      {remoteCount === 0 ?
      // Alone in the worldline — keep the evocative empty state.
      <div className="relative w-full h-full border border-[#c2a98a] bg-[#e3dbcb]/70 backdrop-blur-[1px] overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-20 h-20 sm:w-28 sm:h-28 border border-[#c2a98a] bg-[#ece5d7] flex items-center justify-center mb-4 sm:mb-5">
              <User size={56} className="text-[#a89479]" strokeWidth={1.25} />
            </div>
            <div className="text-[#6b5f4f] tracking-[0.3em] text-[11px] sm:text-xs">
              NO SIGNAL
            </div>
            <div className="text-[#a85a45] tracking-[0.3em] text-[10px] sm:text-[11px] mt-2">
              AWAITING CONVERGENCE
            </div>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#b06450]" />
            <span className="text-[#a85a45] text-[10px] sm:text-[11px] tracking-[0.2em]">
              CHANNEL OPEN
            </span>
          </div>
        </div> :

      <div
        className="w-full h-full grid gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
        }}>

          <AnimatePresence initial={false}>
            {remoteTracks.map((t, i) =>
          <motion.div
            key={t.participant?.identity ?? `p${i}`}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full min-h-0">

                <SubjectTile trackRef={t} index={i} />
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      }

      {/* Self-view PiP (draggable) — always your local camera */}
      {localTrack &&
      <motion.div
        drag
        dragConstraints={{
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }}
        dragElastic={0.08}
        whileDrag={{
          scale: 1.02
        }}
        className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 w-32 h-24 sm:w-56 sm:h-40 z-20 cursor-grab active:cursor-grabbing">

          <SubjectTile trackRef={localTrack} index={remoteCount} isLocal />
        </motion.div>
      }
    </div>);

}
