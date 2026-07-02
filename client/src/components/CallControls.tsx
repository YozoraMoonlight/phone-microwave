import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare } from
'lucide-react';
import { motion } from 'framer-motion';
import { useLocalParticipant } from '@livekit/components-react';
import { ConfirmEndDialog } from './ConfirmEndDialog';
interface CallControlsProps {
  onEnd: () => void;
  onToggleChat: () => void;
  chatOpen: boolean;
  unread: number;
}
export function CallControls({
  onEnd,
  onToggleChat,
  chatOpen,
  unread
}: CallControlsProps) {
  // Live local track state — reflects the real published mic/camera.
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
  useLocalParticipant();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleMic = () => {
    void localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled);
  };
  const toggleCam = () => {
    void localParticipant?.setCameraEnabled(!isCameraEnabled);
  };

  return (
    <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-4 sm:py-5 bg-[#e3dbcb] border-t border-[#c2a98a]">
      <ControlButton
        active={isMicrophoneEnabled}
        onClick={toggleMic}
        icon={isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        label={isMicrophoneEnabled ? 'MIC ON' : 'MIC OFF'} />


      <ControlButton
        active={isCameraEnabled}
        onClick={toggleCam}
        icon={isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        label={isCameraEnabled ? 'CAM ON' : 'CAM OFF'} />


      <ControlButton
        active={chatOpen}
        onClick={onToggleChat}
        badge={unread}
        icon={<MessageSquare size={20} />}
        label="CHAT" />


      <div className="w-px h-12 bg-[#c2a98a] mx-1 sm:mx-2" />

      <ControlButton
        active
        danger
        onClick={() => setConfirmOpen(true)}
        icon={<PhoneOff size={20} />}
        label="END" />


      <ConfirmEndDialog
        open={confirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          onEnd();
        }}
        onCancel={() => setConfirmOpen(false)} />

    </div>);

}
interface ControlButtonProps {
  active: boolean;
  danger?: boolean;
  badge?: number;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}
function ControlButton({
  active,
  danger = false,
  badge = 0,
  onClick,
  icon,
  label
}: ControlButtonProps) {
  // Flat / matte — solid fill when active, hairline outline otherwise. No glow.
  const accent = danger ? '#a85a45' : '#b06450';
  return (
    <motion.button
      whileHover={{
        y: -2
      }}
      whileTap={{
        scale: 0.96
      }}
      transition={{
        duration: 0.12
      }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 w-[72px] sm:w-[88px] h-[64px] sm:h-[72px] border transition-colors"
      style={{
        backgroundColor: active ? accent : 'transparent',
        borderColor: active ? accent : '#c2a98a',
        color: active ? '#f1ebdd' : '#6b5f4f'
      }}>

      {badge > 0 &&
      <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center border border-[#e3dbcb] bg-[#a85a45] px-1 text-[10px] leading-none text-[#f1ebdd]">
          {badge > 9 ? '9+' : badge}
        </span>
      }
      <span>{icon}</span>
      <span className="text-[10px] tracking-[0.15em]">{label}</span>
    </motion.button>);

}
