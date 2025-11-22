import { Menu, MenuButton } from "@headlessui/react"
import { Fragment } from "react"
import { DEFAULT_POKER_VALUES } from "../utils/utils"

export const Card = ({ value }: { value: string }) => {
  return (
    <div className="flex items-center justify-center w-16 h-24 bg-gray-100 border border-gray-300 rounded shadow-md">
      {value}
    </div>
  )
}

export const AllCards = ({ chooseCard }: { chooseCard: Function }) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {DEFAULT_POKER_VALUES.map((pokerValue) => (
        <Menu as={Fragment} key={pokerValue}>
          <MenuButton
            onClick={() => chooseCard(pokerValue)}
            className="focus:outline-none"
          >
            <Card value={pokerValue} />
          </MenuButton>
        </Menu>
      ))}
    </div>
  )
}