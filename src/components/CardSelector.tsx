import React, {  Fragment } from 'react'
import { Label, Radio, RadioGroup } from '@headlessui/react'
import { CheckIcon } from 'lucide-react'


const themeColors = {
  selected: 'bg-blue-600 text-white ring-blue-500 ring-4',
  hover: 'hover:bg-blue-100',
  focus: 'focus:ring-blue-500',
  base: 'bg-white text-gray-900 border-gray-200',
}


const CARD_DECK_CONTAINER_CLASSES = `
  fixed bottom-0 left-0 right-0 w-full p-4 
  bg-gray-900/80 backdrop-blur-sm 
  border-t border-gray-700 shadow-2xl-top
`

const CARD_OPTION_BASE_CLASSES = `
  relative flex-shrink-0 w-24 h-36 m-2 rounded-xl border-2 
  transition-all duration-150 ease-in-out transform
  focus:outline-none focus:ring-2 focus:ring-offset-2
  shadow-lg hover:shadow-xl hover:-translate-y-1
`

interface CardOptionProps {
  value: string // The label on the card (e.g., "5")
}
const CardOption: React.FC<CardOptionProps> = ({ value }) => {

  return (
    <Radio as={Fragment} value={value}>
      {({ checked,hover }) => (
        <button
          className={`
            ${CARD_OPTION_BASE_CLASSES}
            ${checked ? themeColors.selected : themeColors.base}
            ${hover ? themeColors.hover : ''}
            ${!checked ? themeColors.hover : ''}
          `}
        >

          <span
            className="absolute inset-0 block overflow-hidden rounded-xl"
            aria-hidden="true"
          >
            <span
              className="absolute inset-0 transition-opacity duration-300 ease-out opacity-0
                         active:opacity-25 active:bg-black"
            />
          </span>
          

          {checked && (
            <span className="absolute top-2 right-2 p-1 bg-white/30 rounded-full">
              <CheckIcon className="w-4 h-4" />
            </span>
          )}


          <span className="relative z-10">{value}</span>
        </button>
      )}
    </Radio>
  )
}

// --- Main Selector Component ---

interface CardSelectorProps {
  selectedValue: string | null
  onSelectCard: (numericValue: string) => void
  options: string[]
}


export const CardSelector = ({
  selectedValue,
  onSelectCard,
  options,
}: CardSelectorProps) => {

  const handleSelectionChange = (label: string) => {
    onSelectCard(label)
  }

  return (
    <div className={CARD_DECK_CONTAINER_CLASSES}>
      {/* The RadioGroup now uses flex-wrap to allow cards to wrap onto the next line,
        and max-w-6xl mx-auto centers the deck content.
      */}
      <RadioGroup
        value={selectedValue ?? ''}
        onChange={handleSelectionChange}
        className="flex flex-wrap justify-center items-center max-w-6xl mx-auto p-2"
      >
        <Label className="sr-only">Choose your estimate</Label>
        {options.map((value) => (
          <CardOption key={value} value={value} />
        ))}
      </RadioGroup>
    </div>
  )
}