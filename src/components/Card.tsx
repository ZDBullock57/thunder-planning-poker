import { DEFAULT_POKER_VALUES } from "../utils/utils"
import { Fragment } from "react"
import { Menu } from "@headlessui/react"

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
          <Menu.Button
            onClick={() => chooseCard(pokerValue)}
            className="focus:outline-none"
          >
            <Card value={pokerValue} />
          </Menu.Button>
        </Menu>
      ))}
    </div>
  )
}