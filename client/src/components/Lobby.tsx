import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadioTower,
  ArrowRight,
  ChevronLeft,
  AlertTriangle } from
'lucide-react';
import { DivergenceInput } from './DivergenceInput';
import { canConverge } from '../utils/worldline';
interface LobbyProps {
  labMemberNo: string;
  onCreate: () => void;
  onJoin: (worldlineId: string) => void;
}
type Mode = 'select' | 'join';
export function Lobby({ labMemberNo, onCreate, onJoin }: LobbyProps) {
  const [mode, setMode] = useState<Mode>('select');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const formatCode = (raw: string): string => {
    const padded = raw.padEnd(7, '0');
    return `${padded[0]}.${padded.slice(1, 7)}`;
  };
  const complete = code.length === 7;
  const attemptJoin = () => {
    if (!complete) return;
    const worldlineId = formatCode(code);
    if (!canConverge(worldlineId)) {
      setError(true);
      setTimeout(() => setError(false), 1600);
      return;
    }
    onJoin(worldlineId);
  };
  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-md border border-[#c2a98a] bg-[#e3dbcb]/80 backdrop-blur-[1px]">
        {/* Panel header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#c2a98a]">
          <RadioTower size={16} className="text-[#a85a45]" />
          <span className="text-[#a85a45] tracking-[0.25em] text-xs">
            FUTURE GADGET LAB // COMMS
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {mode === 'select' ?
            <motion.div
              key="select"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
              }}
              transition={{
                duration: 0.18
              }}>
              
                <p className="text-[11px] text-[#8a7256] tracking-[0.2em] leading-relaxed mb-6">
                  GREETINGS, LAB MEMBER NO.{labMemberNo}. OPEN A NEW WORLDLINE
                  OR CONVERGE ONTO AN EXISTING ONE.
                </p>

                <div className="flex flex-col gap-3">
                  <LobbyAction
                  primary
                  label="OPEN WORLDLINE"
                  sub="Transmit a D-Mail and host a channel"
                  onClick={onCreate} />
                
                  <LobbyAction
                  label="CONVERGE"
                  sub="Enter a divergence number to join"
                  onClick={() => setMode('join')} />
                
                </div>
              </motion.div> :

            <motion.div
              key="join"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
              }}
              transition={{
                duration: 0.18
              }}>
              
                <button
                onClick={() => {
                  setMode('select');
                  setCode('');
                  setError(false);
                }}
                className="flex items-center gap-1 text-[10px] text-[#8a7256] tracking-[0.2em] mb-5 hover:text-[#a85a45] transition-colors">
                
                  <ChevronLeft size={12} />
                  BACK
                </button>

                <p className="text-[11px] text-[#8a7256] tracking-[0.2em] mb-4">
                  ENTER DIVERGENCE NUMBER
                </p>

                <div className="flex justify-center mb-3">
                  <DivergenceInput
                  value={code}
                  onChange={setCode}
                  error={error} />
                
                </div>

                <AnimatePresence>
                  {error &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -4
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0
                  }}
                  className="flex items-center justify-center gap-2 text-[#a85a45] text-[10px] tracking-[0.2em] mb-3">
                  
                      <AlertTriangle size={12} />
                      WORLDLINE NOT FOUND // DIVERGENCE TOO HIGH
                    </motion.div>
                }
                </AnimatePresence>

                <button
                onClick={attemptJoin}
                disabled={!complete}
                className="w-full mt-3 flex items-center justify-center gap-2 h-11 border tracking-[0.2em] text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: complete ? '#b06450' : 'transparent',
                  borderColor: complete ? '#b06450' : '#c2a98a',
                  color: complete ? '#f1ebdd' : '#6b5f4f'
                }}>
                
                  ATTEMPT CONVERGENCE
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Footer flavor */}
        <div className="px-5 py-2.5 border-t border-[#c2a98a] text-[9px] text-[#8a7256] tracking-[0.2em]">
          THIS CHANNEL IS MONITORED. EL PSY KONGROO.
        </div>
      </div>
    </div>);

}
interface LobbyActionProps {
  label: string;
  sub: string;
  onClick: () => void;
  primary?: boolean;
}
function LobbyAction({
  label,
  sub,
  onClick,
  primary = false
}: LobbyActionProps) {
  return (
    <motion.button
      whileHover={{
        x: 3
      }}
      whileTap={{
        scale: 0.99
      }}
      transition={{
        duration: 0.12
      }}
      onClick={onClick}
      className="group flex items-center justify-between gap-3 px-4 py-3.5 border text-left transition-colors"
      style={{
        backgroundColor: primary ? '#b06450' : 'transparent',
        borderColor: primary ? '#b06450' : '#c2a98a',
        color: primary ? '#f1ebdd' : '#6b5f4f'
      }}>
      
      <span className="min-w-0">
        <span className="block tracking-[0.22em] text-sm">{label}</span>
        <span
          className="block text-[10px] tracking-[0.12em] mt-1"
          style={{
            color: primary ? '#f1ebdd' : '#8a7256'
          }}>
          
          {sub}
        </span>
      </span>
      <ArrowRight
        size={16}
        className="shrink-0 transition-transform group-hover:translate-x-1" />
      
    </motion.button>);

}