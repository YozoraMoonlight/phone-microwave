import React, { useEffect, useState, useRef, Fragment } from 'react';
import { motion } from 'framer-motion';
interface DivergenceInputProps {
  value: string;
  onChange: (val: string) => void;
  // Visual error pulse (e.g. worldline mismatch)
  error?: boolean;
}
// Mechanical split-flap style entry for a divergence number: X.XXXXXX
// 7 cells: 1 whole digit, a fixed dot, 6 fractional digits.
const DIGIT_SLOTS = 7;
export function DivergenceInput({
  value,
  onChange,
  error
}: DivergenceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  // Only keep digits, cap at DIGIT_SLOTS.
  const digits = value.replace(/\D/g, '').slice(0, DIGIT_SLOTS).split('');
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, '').slice(0, DIGIT_SLOTS));
  };
  const cells = Array.from(
    {
      length: DIGIT_SLOTS
    },
    (_, i) => digits[i] ?? ''
  );
  const activeIndex = digits.length;
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.focus()}
      className="group relative flex items-stretch gap-px border border-[#c2a98a] bg-[#c2a98a]"
      aria-label="Enter divergence number">
      
      {/* Hidden real input drives the mechanical display */}
      <input
        ref={inputRef}
        value={digits.join('')}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="off"
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        aria-label="Divergence number digits" />
      

      {cells.map((char, i) => {
        // Insert the fixed decimal dot after the first digit cell.
        const showDot = i === 1;
        const isActive = focused && i === activeIndex;
        return (
          <Fragment key={i}>
            {showDot &&
            <span className="flex items-end justify-center px-1 sm:px-1.5 pb-1.5 text-[#a85a45] text-2xl sm:text-3xl leading-none bg-[#e3dbcb]">
                .
              </span>
            }
            <motion.span
              animate={
              error ?
              {
                backgroundColor: ['#e3dbcb', '#a85a45', '#e3dbcb']
              } :
              {
                backgroundColor: '#e3dbcb'
              }
              }
              transition={{
                duration: 0.4,
                repeat: error ? 2 : 0
              }}
              className="relative flex items-center justify-center w-7 h-11 sm:w-9 sm:h-14 text-[#a85a45] text-2xl sm:text-3xl leading-none">
              
              {char ||
              <span className="text-[#c2a98a]">{isActive ? '' : '_'}</span>
              }
              {isActive &&
              <motion.span
                className="absolute bottom-1.5 w-4 sm:w-5 h-0.5 bg-[#a85a45]"
                animate={{
                  opacity: [1, 0.15, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }} />

              }
            </motion.span>
          </Fragment>);

      })}
    </button>);

}