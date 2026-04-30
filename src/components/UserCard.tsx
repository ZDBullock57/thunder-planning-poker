import { forwardRef, type ReactNode } from 'react'
import { CheckIcon, HourglassIcon } from './Icons'

/**
 * CORE CARD STYLES
 * Base styles for the User Card container.
 * Dark mode theme for sleek appearance.
 */
const CARD_BASE_CLASSES = 'rounded-xl p-3 shadow-md transition-all duration-300'
const CARD_SIZE_CLASSES = 'min-h-20 w-28 flex flex-col justify-between'
const CARD_STATE_PENDING_VOTE =
  'bg-slate-800 border-2 border-slate-600 border-dashed hover:border-slate-500'
const CARD_STATE_VOTED =
  'bg-indigo-900/50 border-2 border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
const CARD_STATE_REVEALED =
  'bg-slate-800 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
const CARD_STATE_CLICKABLE =
  'bg-slate-800 border-2 border-amber-500/50 border-dashed hover:border-amber-400 hover:bg-slate-700/50 cursor-pointer'
const CONTENT_BASE_CLASSES = 'text-3xl font-extrabold'
const CONTENT_COLOR_VOTING = 'text-indigo-400'
const CONTENT_COLOR_REVEALED = 'text-white'

/**
 * Pass prop to card that is the value? Iterate through the possible values and show a bunch of cards?
 * or is that silly to have a component that is literally a div
 */

export interface UserCardProps {
  content: ReactNode | null
  userName: string
  isRevealed: boolean
  onClick?: () => void
}

export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(
  ({ userName, content, isRevealed, onClick }, ref) => {
    const hasVoted = content !== null && content !== ''
    let stateClasses = ''
    let contentColorClass = CONTENT_COLOR_REVEALED

    if (!isRevealed) {
      contentColorClass = CONTENT_COLOR_VOTING
      if (hasVoted) {
        stateClasses = CARD_STATE_VOTED
      } else if (onClick) {
        stateClasses = CARD_STATE_CLICKABLE
      } else {
        stateClasses = CARD_STATE_PENDING_VOTE
      }
    } else {
      stateClasses = CARD_STATE_REVEALED
    }

    let displayContent: ReactNode

    if (!isRevealed && !hasVoted) {
      displayContent = (
        <HourglassIcon
          className={onClick ? 'text-amber-400' : 'text-slate-500'}
          size={24}
        />
      )
    } else if (!isRevealed && hasVoted) {
      displayContent = <CheckIcon className="text-indigo-400" size={24} />
    } else {
      displayContent = content || (
        <HourglassIcon className="text-slate-500" size={24} />
      )
    }

    return (
      <div
        ref={ref}
        className={`${CARD_BASE_CLASSES} ${CARD_SIZE_CLASSES} ${stateClasses}`}
        onClick={onClick}
        title={onClick ? `Throw a cat at ${userName}!` : undefined}
      >
        <p className="text-xs font-semibold text-slate-400 truncate w-full">
          {userName}
        </p>

        <div className="flex-grow flex items-center justify-center">
          <p className={`${CONTENT_BASE_CLASSES} ${contentColorClass}`}>
            {displayContent}
          </p>
        </div>
      </div>
    )
  }
)

UserCard.displayName = 'UserCard'
