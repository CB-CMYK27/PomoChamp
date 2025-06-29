import React from 'react';

/** 25 chunks, 1 chunk = 1 minute */
interface Props { minutesFilled: number }

const MinuteMeter: React.FC<Props> = ({ minutesFilled }) => {
  /** colour bands: 0-4 red, 5-14 orange, 15-24 yellow, 25 green */
  const getColour = (i: number) => {
    if (i < 5)  return 'bg-danger';      // pureRed
    if (i < 15) return 'bg-warning';     // deepOrange
    if (i < 25) return 'bg-accent';      // lightYellow
    return 'bg-success';                 // goldenYellow (greenish)
  };

  return (
    <div className="flex gap-[2px] pt-4">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i}
          className={
            `h-[10px] flex-1 skew-x-[-20deg] 
             ${i < minutesFilled ? getColour(i) : 'bg-bezel/30'}`
          }
        />
      ))}
    </div>
  );
};

export default MinuteMeter;
