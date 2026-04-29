import React, { useState } from 'react';

type RevealButtonProps = {
  onReveal?: () => void;
  label?: string;
};

export const RevealButton: React.FC<RevealButtonProps> = ({
  onReveal,
  label = 'Reveal Cards',
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); // Reset after 300ms
    onReveal?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full relative px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors ${
        isClicked ? 'ring-4 ring-indigo-300' : ''
      }`}
    >
      <span>{label}</span>
    </button>
  );
};