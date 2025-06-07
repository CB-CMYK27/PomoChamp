import React from 'react';

interface Props {
  used: number;       // minutes already allocated in this round
  max?: number;       // default 25
}

const RoundCard: React.FC<Props> = ({ used, max = 25 }) => {
  const isFull  = used === max;
  const colour  = isFull ? 'text-neonYel' : 'text-neonRed';

  return (
    <div className="flex justify-between items-center px-4 py-2 border border-crtBlue rounded-lg">
      {/* used minutes */}
      <span className={`${colour} font-arcade text-lg`}>
        {used}
      </span>

      {/* divider */}
      <span className="text-white/70 font-arcade text-xs">
        {max}/25
      </span>
    </div>
  );
};

export default RoundCard;
