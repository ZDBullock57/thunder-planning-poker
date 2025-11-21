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
      className={`relative px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isClicked ? 'ring-4 ring-blue-300' : ''
      }`}
    >
      <span>{label}</span>
    </button>
  );
};
