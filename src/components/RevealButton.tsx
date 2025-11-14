import React, { useRef, useState } from 'react';


type RevealButtonProps = {
  onReveal?: () => void;
  label?: string;
};

export const RevealButton: React.FC<RevealButtonProps> = ({
  onReveal,
  label = 'Reveal Cards',
}) => {
  const [isBursting, setIsBursting] = useState(false);
  const burstTimeoutRef = useRef<number | null>(null);

  const handleClick = () => {
    setIsBursting(true);
    burstTimeoutRef.current = window.setTimeout(() => {
      setIsBursting(false);
    }, 600);

    onReveal?.();
  };

  return (
    <button
      type="button"
      className={`magic-btn reveal-btn ${isBursting ? 'reveal-btn--burst' : ''}`}
      onClick={handleClick}
    >
      <span className="magic-btn__glow" />
      <span className="magic-btn__shine" />
      <span className="magic-btn__label">{label}</span>
      <span className="reveal-btn__sparkles">
        <span className="sparkle sparkle--1" />
        <span className="sparkle sparkle--2" />
        <span className="sparkle sparkle--3" />
        <span className="sparkle sparkle--4" />
      </span>
    </button>
  );
};
