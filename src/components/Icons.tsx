import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export const ClockIcon: React.FC<IconProps> = ({ className = '', size = 14 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const PlayIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export const PauseIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
  >
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

export const CheckIcon: React.FC<IconProps> = ({ className = '', size = 14 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const CopyIcon: React.FC<IconProps> = ({ className = '', size = 14 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const SparklesIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
    <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
  </svg>
)

export const HourglassIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
)

export const CatIcon: React.FC<IconProps> = ({ className = '', size = 40 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
  >
    {/* Ears */}
    <path d="M12 28L8 8l16 14z" fill="currentColor" />
    <path d="M52 28l4-20-16 14z" fill="currentColor" />
    <path d="M14 26l-4-14 12 10z" fill="#ffa0b0" />
    <path d="M50 26l4-14-12 10z" fill="#ffa0b0" />
    {/* Face */}
    <ellipse cx="32" cy="38" rx="22" ry="20" fill="currentColor" />
    {/* Eyes */}
    <ellipse cx="22" cy="34" rx="5" ry="6" fill="white" />
    <ellipse cx="42" cy="34" rx="5" ry="6" fill="white" />
    <ellipse cx="23" cy="35" rx="3" ry="4" fill="#2d3748" />
    <ellipse cx="43" cy="35" rx="3" ry="4" fill="#2d3748" />
    <circle cx="24" cy="33" r="1.5" fill="white" />
    <circle cx="44" cy="33" r="1.5" fill="white" />
    {/* Nose */}
    <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="#ffa0b0" />
    {/* Mouth */}
    <path d="M32 44.5 Q28 50 24 46" stroke="#2d3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M32 44.5 Q36 50 40 46" stroke="#2d3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Whiskers */}
    <line x1="10" y1="38" x2="18" y2="40" stroke="#2d3748" strokeWidth="1" strokeLinecap="round" />
    <line x1="10" y1="44" x2="18" y2="44" stroke="#2d3748" strokeWidth="1" strokeLinecap="round" />
    <line x1="10" y1="50" x2="18" y2="48" stroke="#2d3748" strokeWidth="1" strokeLinecap="round" />
    <line x1="54" y1="38" x2="46" y2="40" stroke="#2d3748" strokeWidth="1" strokeLinecap="round" />
    <line x1="54" y1="44" x2="46" y2="44" stroke="#2d3748" strokeWidth="1" strokeLinecap="round" />
    <line x1="54" y1="50" x2="46" y2="48" stroke="#2d3748" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
