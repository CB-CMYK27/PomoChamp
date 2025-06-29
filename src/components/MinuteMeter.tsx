import React from 'react';

interface Props { 
  minutesFilled: number; 
}

const MinuteMeter: React.FC<Props> = ({ minutesFilled }) => {
  /**
   * Colour lookup
   *  • 0-4  ➜ danger  (pure red)
   *  • 5-9  ➜ redOrange
   *  • 10-14 ➜ deepOrange
   *  • 15-19 ➜ primary  (FFC300 – golden yellow)
   *  • 20-24 ➜ successGreen
   */
  const colourFor = (i: number) => {
    if (i >= 20) return 'bg-successGreen';
    if (i >= 15) return 'bg-primary';
    if (i >= 10) return 'bg-deepOrange';
    if (i >= 5)  return 'bg-redOrange';
    return 'bg-danger';
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

/**
 * ↕️  HIDDEN SAFELIST  — ensures Tailwind never purges these colours
 * bg-danger bg-redOrange bg-deepOrange bg-primary bg-successGreen
 */

export default MinuteMeter;