import React, { Fragment } from 'react'
import { Label, Radio, RadioGroup } from '@headlessui/react'
import { CheckIcon } from 'lucide-react'

const themeColors = {
  selected: 'bg-indigo-600 text-white ring-indigo-400 ring-4',
  hover: 'hover:bg-slate-700',
  focus: 'focus:ring-indigo-500',
  base: 'bg-slate-800 text-slate-100 border-slate-600',
}

const CARD_DECK_CONTAINER_CLASSES = `
  fixed bottom-0 left-0 p-3
  bg-slate-900/95 backdrop-blur-sm
  border-t border-slate-700
  w-full
  flex flex-nowrap overflow-x-auto
  items-center
  scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900
`

const CARD_OPTION_BASE_CLASSES = `
  relative flex-shrink-0 w-20 h-28 rounded-xl border-2 
  transition-all duration-150 ease-in-out transform
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
  shadow-lg hover:shadow-xl hover:-translate-y-1
`

interface CardOptionProps {
  value: string // The label on the card (e.g., "5")
}
const CardOption: React.FC<CardOptionProps> = ({ value }) => {
  return (
    <Radio as={Fragment} value={value}>
      {({ checked, hover }) => (
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
      <RadioGroup
        value={selectedValue ?? ''}
        onChange={handleSelectionChange}
        className="flex flex-nowrap items-center mx-auto gap-4"
      >
        <Label className="sr-only">Choose your estimate</Label>
        {options.map((value) => (
          <CardOption key={value} value={value} />
        ))}
      </RadioGroup>
    </div>
  )
}
