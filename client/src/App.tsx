import React, { useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { RoomAudioRenderer } from '@livekit/components-react';
import { DivergenceTimer } from './components/DivergenceTimer';
import { CallControls } from './components/CallControls';
import { ParticipantView } from './components/ParticipantView';
import { ConvergenceLog } from './components/ConvergenceLog';
import { ChatPanel } from './components/ChatPanel';
import { Gears } from './components/Gears';
import { Lobby } from './components/Lobby';
import { ConnectingSequence } from './components/ConnectingSequence';
import { generateWorldlineId, assignLabMemberNo } from './utils/worldline';
import { useScreenInit } from './useScreenInit.js';
import { useRoomConnection } from './hooks/useRoomConnection';
type Phase = 'lobby' | 'connecting' | 'call';
export function App() {
  const screenInit = useScreenInit();
  const [phase, setPhase] = useState<Phase>(
    screenInit.phase as Phase ?? 'lobby'
  );
  const [mode, setMode] = useState<'create' | 'join'>(
    screenInit.mode as 'create' | 'join' ?? 'create'
  );
  const [worldlineId, setWorldlineId] = useState('1.048596');
  const [labMemberNo] = useState(() => assignLabMemberNo());
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Real LiveKit room lifecycle. Replaces the old mock mute/video state —
  // controls and tiles now read live track state from the room itself.
  const { room, status, error, connect, disconnect } = useRoomConnection();

  const handleCreate = () => {
    const id = generateWorldlineId();
    setMode('create');
    setWorldlineId(id);
    setPhase('connecting');
    void connect(id, labMemberNo);
  };
  const handleJoin = (id: string) => {
    setMode('join');
    setWorldlineId(id);
    setPhase('connecting');
    void connect(id, labMemberNo);
  };
  const handleEnd = () => {
    void disconnect();
    setChatOpen(false);
    setUnread(0);
    setPhase('lobby');
  };
  return (
    <RoomContext.Provider value={room}>
    <div className="relative w-full h-screen bg-[#ece5d7] text-[#3a342c] overflow-hidden flex flex-col font-['Share_Tech_Mono'] selection:bg-[#b06450] selection:text-[#f1ebdd]">
      {/* Atmospheric background: faded key art + slowly rotating rust gears */}
      <Gears />

      {/* Paper grain over everything (matte, no glow) */}
      <div className="absolute inset-0 paper-grain opacity-40 pointer-events-none mix-blend-multiply" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#c2a98a] bg-[#e3dbcb]/80 backdrop-blur-[1px]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 bg-[#b06450] shrink-0" />
          <div className="leading-tight min-w-0">
            <h1 className="text-xs sm:text-sm tracking-[0.3em] text-[#a85a45] truncate">
              FGL COMMS LINK
            </h1>
            <p className="text-[9px] sm:text-[10px] text-[#8a7256] tracking-[0.2em] sm:tracking-[0.25em] truncate">
              {phase === 'call' ?
              `WORLDLINE ${worldlineId} / ENCRYPTED` :
              'SECURE CHANNEL / ENCRYPTED'}
            </p>
          </div>
        </div>

        {phase === 'call' && <DivergenceTimer />}
      </header>

      {/* Main Stage — phase driven */}
      {phase === 'call' ?
      // Live call: main holds the video (flex-1), the control bar sits
      // BELOW it as a sibling — same structure as the prototype so the
      // three buttons always keep their own space and never overlap.
      <>
          <main className="relative z-10 flex-1 flex flex-col min-h-0">
            <ConvergenceLog />
            <ParticipantView />
            <ChatPanel
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            onUnreadChange={setUnread} />

          </main>
          <CallControls
          onEnd={handleEnd}
          onToggleChat={() => setChatOpen((v) => !v)}
          chatOpen={chatOpen}
          unread={unread} />
          {/* Plays remote participant audio. */}
          <RoomAudioRenderer />
        </> :

      <main className="relative z-10 flex-1 flex flex-col min-h-0">
          {phase === 'lobby' &&
        <Lobby
          labMemberNo={labMemberNo}
          onCreate={handleCreate}
          onJoin={handleJoin} />

        }

          {phase === 'connecting' &&
        <ConnectingSequence
          mode={mode}
          worldlineId={worldlineId}
          labMemberNo={labMemberNo}
          ready={status === 'connected'}
          error={status === 'error' ? error : null}
          onComplete={() => setPhase('call')}
          onAbort={handleEnd} />

        }
        </main>
      }
    </div>
    </RoomContext.Provider>);

}
