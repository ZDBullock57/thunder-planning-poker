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
import { UserCard } from './UserCard'
import { useStorage } from '../utils/storage'
import { CountdownTimer } from './CountdownTimer'
import { CardSelector } from './CardSelector'

export const ParticipantView = ({ joinId }: { joinId: string }) => {
  const [name, setName] = useStorage('name', '')
  const [vote, setVote] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(true)

  const { data, sendData, connected } = useHostConnection<HostData, UserData>(
    joinId
  )

  useEffect(
    function updateTitle() {
      window.document.title = data?.sessionName || "Where's the Lamb Sauce?"
    },
    [data?.sessionName]
  )

  const chooseCard = (value: string) => {
    setVote(value)
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
  useEffect(
    function resetVoteIfNotInOptions() {
      if (data?.options && vote && !data.options.includes(vote)) {
        chooseCard('')
      }
    },
    [data?.options]
  )

  const isRevealed = data?.revealed === true

  const voteStatus = vote
    ? isRevealed
      ? `Your vote: ${vote}`
      : `Voted: ${vote}`
    : 'Select your card'

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
    <div className="flex flex-col h-screen overflow-hidden">
      {!isModalOpen ? (
        <div className="flex-grow overflow-y-auto p-6 space-y-6 pb-48">
          <h2 className="text-2xl font-bold text-gray-800">
            {data?.sessionName}
          </h2>
          <p className="text-lg text-gray-600">{`Welcome, ${name}!`}</p>
          {data?.details && (
            <p className="text-lg text-gray-600 italic mb-4 p-3 bg-gray-50 rounded-lg">
              Details: {data.details}
            </p>
          )}

          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <p className="text-lg font-medium text-gray-700">
              Round: <span className="font-bold">{data?.round || 1}</span>
            </p>

            <div className="flex justify-center items-center">
              {data?.countdownPaused ? (
                <div>Timer Paused</div>
              ) : data?.countdownStartTimestamp !== null &&
                data?.timeLimitSeconds !== undefined ? (
                <CountdownTimer
                  durationSeconds={data.timeLimitSeconds}
                  startTimestamp={data?.countdownStartTimestamp ?? null}
                />
              ) : (
                <div className="text-2xl font-semibold text-gray-500 py-2">
                  Timer Stopped
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <p
              className={`text-xl font-bold transition-colors duration-300 ${
                vote ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {voteStatus}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {isRevealed ? (
              // Show shuffled votes after reveal with no names
              data?.cards?.map((voteContent, i) => (
                <UserCard
                  key={i}
                  userName=""
                  content={voteContent}
                  isRevealed={true}
                />
              ))
            ) : (
              data?.hasVoted?.map((voted, i) => {
                const userName = data?.userNames?.[i] || `Participant ${i + 1}`
                return (
                  <UserCard
                    key={i}
                    userName=""
                    content={voteContent}
                    isRevealed={true}
                  />
                ))
              : data?.hasVoted?.map((voted, i) => {
                  const userName =
                    data?.userNames?.[i] || `Participant ${i + 1}`
                  return (
                    <UserCard
                      key={i}
                      userName={userName}
                      content={voted ? '✓' : null}
                      isRevealed={false}
                    />
                  )
                })}
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
      <CardSelector
        selectedValue={vote || null}
        onSelectCard={chooseCard}
        options={data?.options ?? []}
      />
    </div>
  )
}
