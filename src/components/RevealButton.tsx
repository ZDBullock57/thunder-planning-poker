import React, { useRef, useState } from 'react';
import { Transition } from '@headlessui/react';

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
      onClick={handleClick}
      className="relative px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <span>{label}</span>
      <Transition
        show={isBursting}
        enter="transition-transform duration-300"
        enterFrom="scale-75 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition-transform duration-300"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-75 opacity-0"
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-full h-full bg-blue-300 rounded-full opacity-50" />
      </Transition>
    </button>
  );
};
