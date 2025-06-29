import React from 'react';

/**
 * 25-segment 16-bit “fuel bar”.
 *  0-4   min  = pure red
 *  5-9   min  = red-orange
 * 10-14  min  = deep orange
 * 15-24  min  = yellow
 * 25/25  min  = success green
 */
interface Props { minutesFilled: number }

const MinuteMeter: React.FC<Props> = ({ minutesFilled }) => {
  /** decide colour for each slot */
  const colourFor = (i: number) => {
    if (i < 5)   return 'bg-danger';      // #FE1C06  🔴
    if (i < 10)  return 'bg-redOrange';   // #FF3A08  🟥🟧
    if (i < 15)  return 'bg-deepOrange';  // #FF7300  🟧
    if (i < 25)  return 'bg-accent';      // #FFE56A  🟨
    return 'bg-successGreen';            // #2ECC40  🟩
  };

  return (
    <div className="flex gap-[2px] pt-4 w-full">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className={
            `h-[10px] flex-1 skew-x-[-20deg] rounded-[1px]
             ${i < minutesFilled ? colourFor(i) : 'bg-bezel/30'}`
          }
        />
      ))}
    </div>
  );
};

export default MinuteMeter;
