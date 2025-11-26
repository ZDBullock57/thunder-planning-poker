import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import type { HostData, UserData } from '../types'
import { useHostConnection } from '../utils/peerUtils'
import { AllCards, Card } from './Card'
import { UserCard } from './UserCard'
import { useStorage } from '../utils/storage'

export const ParticipantView = ({ joinId }: { joinId: string }) => {
  const [name, setName] = useStorage('name', '')
  const [card, setCard] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(true)

  const { data, sendData, connected } = useHostConnection<HostData, UserData>(
    joinId
  )

  const chooseCard = (value: string) => {
    setCard(value)
    sendData({ vote: value || null })
  }
  useEffect(
    function resetVoteOnNewRound() {
      if (data?.round !== 1) {
        chooseCard('')
      }
    },
    [data?.round]
  )

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-700">
          Connecting to host...
        </p>
      </div>
    )
  }

  return (
    <>
      {!isModalOpen ? (
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {data?.sessionName}
          </h2>
          <p className="text-lg text-gray-600">{`Welcome, ${name}!`}</p>
          <pre className="p-4 bg-gray-100 rounded-md text-gray-700">
            {data?.details || '(Host has not provided any details yet)'}
          </pre>
          <div className="space-y-4">
            {data?.cards?.map((content, i) => (
              <UserCard key={i} userName={content ?? ''} />
            ))}
          </div>
          <div className="mt-4">
            {card ? (
              <Card value={card} />
            ) : (
              <AllCards chooseCard={chooseCard} />
            )}
          </div>
          <button
            className="px-4 py-2 mt-4 text-white bg-red-500 rounded-md hover:bg-red-600"
            onClick={() => chooseCard('')}
          >
            Clear choice
          </button>
        </div>
      ) : (
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsModalOpen(false)}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-full p-4 text-center">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Enter your name
                    </DialogTitle>
                    <form
                      className="mt-4"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const name = formData.get('name') as string
                        if (!name.trim()) return
                        setName(name)
                        sendData({ name })
                        setIsModalOpen(false)
                      }}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Name:
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                          defaultValue={name}
                        />
                      </label>
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  )
}
