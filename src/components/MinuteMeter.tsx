import React from 'react';

interface Props { minutesFilled: number; }  // 0-25

const colourFor = (idx: number) => {
  if (idx < 5)  return 'bg-danger';        // 1-5   red
  if (idx < 15) return 'bg-warning';       // 6-15  orange
  if (idx < 20) return 'bg-accent';        // 16-20 yellow
  return 'bg-successGreen';                // 21-25 green
};

export default function MinuteMeter({ minutesFilled }: Props) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className={
            'w-[10px] h-[10px] skew-x-[-20deg] ' +
            (i < minutesFilled ? colourFor(i) : 'bg-gray-700/40')
          }
        />
      ))}
    </div>
  );
}