import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Confirmation before leaving the worldline. Ending a call is irreversible
// (you'd have to re-converge), so we gate the END button behind this.
export function ConfirmEndDialog({
  open,
  onConfirm,
  onCancel
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Esc cancels, Enter confirms — keyboard parity with the buttons.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}>

          {/* Backdrop */}
          <div
          className="absolute inset-0 bg-[#2a251e]/55 backdrop-blur-[2px]"
          onClick={onCancel} />

          {/* Panel */}
          <motion.div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-sm border border-[#c2a98a] bg-[#e3dbcb] shadow-[4px_4px_0_rgba(58,52,44,0.18)]"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}>

            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-[#c2a98a] bg-[#ece5d7] px-4 py-2.5">
              <span className="text-[#a85a45]">
                <AlertTriangle size={15} strokeWidth={2} />
              </span>
              <span className="text-[#a85a45] text-[11px] tracking-[0.28em]">
                DIVERGENCE WARNING
              </span>
            </div>

            {/* Body */}
            <div className="px-4 py-5">
              <p className="text-[#6b5f4f] text-xs sm:text-[13px] tracking-[0.08em] leading-relaxed">
                Leaving collapses your link to this worldline. To rejoin you
                must converge again.
              </p>
              <p className="mt-3 text-[#8a7256] text-[10px] tracking-[0.2em]">
                END TRANSMISSION?
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-stretch gap-2 border-t border-[#c2a98a] px-4 py-3">
              <button
              onClick={onCancel}
              className="flex-1 border border-[#c2a98a] bg-transparent px-3 py-2 text-[#6b5f4f] text-[10px] tracking-[0.2em] transition-colors hover:bg-[#ece5d7]">

                STAY
              </button>
              <button
              onClick={onConfirm}
              className="flex-1 border border-[#a85a45] bg-[#a85a45] px-3 py-2 text-[#f1ebdd] text-[10px] tracking-[0.2em] transition-colors hover:bg-[#96503d]">

                END LINK
              </button>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}
