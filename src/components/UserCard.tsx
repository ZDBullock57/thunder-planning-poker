/**
 * CORE CARD STYLES
 * Base styles for the User Card container.
 * TODO: These can be pulled out and converted to **design tokens** as part of a centralized **theme** once that structure is established.
 */
const CARD_BASE_CLASSES = "rounded-xl p-4 shadow-md transition-all duration-300";
const CARD_SIZE_CLASSES = "min-h-24 w-full max-w-xs flex flex-col justify-between";
const CARD_STATE_PENDING_VOTE = "bg-gray-50 border-2 border-gray-300 border-dashed hover:border-gray-400";
const CARD_STATE_VOTED = "bg-blue-100 border-2 border-blue-500 hover:shadow-lg";
const CARD_STATE_REVEALED = "bg-white border-2 border-green-500 shadow-xl";
const CONTENT_BASE_CLASSES = "text-4xl font-extrabold";
const CONTENT_COLOR_VOTING = "text-blue-600";
const CONTENT_COLOR_REVEALED = "text-gray-800"; 


/**
 * Pass prop to card that is the value? Iterate through the possible values and show a bunch of cards?
 * or is that silly to have a component that is literally a div
 */

export interface UserCardProps {
  content: string | null;
  userName: string;
  isRevealed: boolean;
}

export const UserCard = ({  userName, content, isRevealed }: UserCardProps) => {
  const hasVoted = content !== null && content !== '';
  let stateClasses = "";
  let contentColorClass = CONTENT_COLOR_REVEALED; 

  if (!isRevealed) {
    contentColorClass = CONTENT_COLOR_VOTING; 
    if (hasVoted) {
      stateClasses = CARD_STATE_VOTED;
    } else {
      stateClasses = CARD_STATE_PENDING_VOTE;
    }
  } else {
    stateClasses = CARD_STATE_REVEALED;
  }

  let displayContent: string;
  
  if (!isRevealed && !hasVoted) {
    displayContent = '⏳';
  } else if (!isRevealed && hasVoted) {
    displayContent = '✔️'; 
  } else {
    displayContent = content || '⏳';
  }

  return (
    <div className={`${CARD_BASE_CLASSES} ${CARD_SIZE_CLASSES} ${stateClasses}`}>
      
      <p className="text-sm font-semibold text-gray-700 truncate w-full mb-1">
        {userName}
      </p>

      <div className="flex-grow flex items-center justify-center pt-1">
        <p className={`${CONTENT_BASE_CLASSES} ${contentColorClass}`}>
          {displayContent}
        </p>
      </div>
    </div>
  );
};