import { Menu, MenuButton } from '@headlessui/react'
import { Fragment } from 'react'

export const Card = ({ value }: { value: string }) => {
  return (
    <div className="flex items-center justify-center w-16 h-24 bg-gray-100 border border-gray-300 rounded shadow-md">
      {value}
    </div>
  )
}

export const AllCards = ({
  options,
  chooseCard,
}: {
  options: string[]
  chooseCard: Function
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {options.map((value) => (
        <Menu as={Fragment} key={value}>
          <MenuButton
            onClick={() => chooseCard(value)}
            className="focus:outline-none"
          >
            <Card value={value} />
          </MenuButton>
        </Menu>
      ))}
    </div>
  )
}
