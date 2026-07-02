import React, { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat, useLocalParticipant } from '@livekit/components-react';

// Format an epoch-ms timestamp as HH:MM (24h) for the message meta line.
function stamp(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

// In-call chat over the worldline. Real LiveKit chat (data messages) via
// useChat — history lives only for the session, matching FGL "no logs" flavor.
export function ChatPanel({
  open,
  onClose,
  onUnreadChange
}: {
  open: boolean;
  onClose: () => void;
  onUnreadChange: (n: number) => void;
}) {
  const { chatMessages, send, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [draft, setDraft] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // How many messages the user has already seen (for the unread badge).
  const seenCount = useRef(0);

  // While open, everything is "seen"; report zero unread. While closed,
  // report how many arrived since we last had it open.
  useEffect(() => {
    if (open) {
      seenCount.current = chatMessages.length;
      onUnreadChange(0);
    } else {
      onUnreadChange(Math.max(0, chatMessages.length - seenCount.current));
    }
  }, [open, chatMessages.length, onUnreadChange]);

  // Autoscroll to the newest message when open.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages.length, open]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;
    void send(text);
    setDraft('');
  };

  return (
    <AnimatePresence>
      {open &&
      <motion.aside
        className="absolute top-0 right-0 z-40 flex h-full w-full max-w-[340px] flex-col border-l border-[#c2a98a] bg-[#e3dbcb] shadow-[-4px_0_16px_rgba(58,52,44,0.12)]"
        style={{ willChange: 'opacity' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#c2a98a] bg-[#ece5d7] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#b06450]" />
              <span className="text-[#a85a45] text-[11px] tracking-[0.28em]">
                COMMS LOG
              </span>
            </div>
            <button
            onClick={onClose}
            aria-label="Close chat"
            className="text-[#8a7256] transition-colors hover:text-[#a85a45]">

              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">

            {chatMessages.length === 0 ?
            <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-[#a89479] text-[10px] tracking-[0.25em]">
                  NO TRANSMISSIONS
                </p>
                <p className="mt-1 text-[#a89479]/70 text-[9px] tracking-[0.2em]">
                  SEND A MESSAGE TO THE WORLDLINE
                </p>
              </div> :

            chatMessages.map((msg) => {
              const mine = msg.from?.identity === localParticipant?.identity;
              const who = mine ?
              'YOU' :
              msg.from?.name || msg.from?.identity || 'UNKNOWN';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>

                    <div className="mb-1 flex items-center gap-2">
                      <span
                      className="text-[9px] tracking-[0.2em]"
                      style={{ color: mine ? '#a85a45' : '#8a7256' }}>

                        {who}
                      </span>
                      <span className="text-[8px] tracking-[0.15em] text-[#a89479]">
                        {stamp(msg.timestamp)}
                      </span>
                    </div>
                    <div
                    className="max-w-[85%] border px-2.5 py-1.5 text-xs leading-relaxed break-words"
                    style={{
                      borderColor: '#c2a98a',
                      backgroundColor: mine ? '#efe7d6' : '#ece5d7',
                      color: '#3a342c'
                    }}>

                      {msg.message}
                    </div>
                  </div>);

            })
            }
          </div>

          {/* Composer */}
          <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t border-[#c2a98a] bg-[#ece5d7] px-3 py-3">

            <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="TRANSMIT…"
            maxLength={500}
            className="flex-1 min-w-0 border border-[#c2a98a] bg-[#f1ebdd] px-3 py-2 text-xs text-[#3a342c] tracking-[0.08em] placeholder:text-[#a89479] placeholder:tracking-[0.2em] outline-none focus:border-[#a85a45]" />

            <button
            type="submit"
            disabled={!draft.trim() || isSending}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#a85a45] bg-[#a85a45] text-[#f1ebdd] transition-colors hover:bg-[#96503d] disabled:cursor-not-allowed disabled:border-[#c2a98a] disabled:bg-transparent disabled:text-[#a89479]">

              <Send size={15} />
            </button>
          </form>
        </motion.aside>
      }
    </AnimatePresence>);

}
