import React from 'react';
import { motion } from 'framer-motion';
interface GearProps {
  size: number;
  teeth?: number;
  color: string;
  strokeWidth?: number;
  fill?: string;
}
// A single mechanical gear rendered as an SVG outline.
function Gear({
  size,
  teeth = 12,
  color,
  strokeWidth = 6,
  fill = 'none'
}: GearProps) {
  const cx = 100;
  const cy = 100;
  const outer = 92;
  const inner = 78;
  const hub = 30;
  const bore = 14;
  // Build the toothed outline path.
  const points: string[] = [];
  const steps = teeth * 2;
  for (let i = 0; i < steps; i++) {
    const angle = i / steps * Math.PI * 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      
      <polygon
        points={points.join(' ')}
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round" />
      
      <circle
        cx={cx}
        cy={cy}
        r={hub}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth} />
      
      <circle
        cx={cx}
        cy={cy}
        r={bore}
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth} />
      
    </svg>);

}
interface RotatingGearProps extends GearProps {
  className?: string;
  duration: number;
  direction?: 1 | -1;
}
function RotatingGear({
  className,
  duration,
  direction = 1,
  ...gear
}: RotatingGearProps) {
  return (
    <motion.div
      className={`absolute ${className ?? ''}`}
      animate={{
        rotate: 360 * direction
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear'
      }}>
      
      <Gear {...gear} />
    </motion.div>);

}
const RUST = '#b06450';
const CLAY = '#a85a45';
export function Gears() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true">
      
      {/* Faded key art watermark */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-multiply"
        style={{
          backgroundImage:
          'url("https://cdn.magicpatterns.com/uploads/c1ny7xU6QqrMxkgCqixVBd/pasted-image.jpg")',
          filter: 'sepia(0.4) saturate(0.7)'
        }} />
      

      {/* Interlocking rust gears, very slow + calm */}
      <RotatingGear
        className="-left-32 top-1/2 -translate-y-1/2"
        size={420}
        teeth={16}
        color={RUST}
        strokeWidth={4}
        duration={90}
        direction={1} />
      
      <RotatingGear
        className="left-32 top-[58%]"
        size={260}
        teeth={12}
        color={CLAY}
        strokeWidth={5}
        duration={64}
        direction={-1} />
      
      <RotatingGear
        className="-right-24 -top-20"
        size={340}
        teeth={14}
        color={RUST}
        strokeWidth={4}
        duration={110}
        direction={-1} />
      
      <RotatingGear
        className="right-40 bottom-[-60px]"
        size={200}
        teeth={10}
        color={CLAY}
        strokeWidth={5}
        duration={52}
        direction={1} />
      

      {/* Wash to keep gears as faint atmosphere */}
      <div className="absolute inset-0 bg-[#ece5d7] opacity-[0.55]" />
    </div>);

}