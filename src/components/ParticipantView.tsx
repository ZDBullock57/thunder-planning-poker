import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CatThrowEvent, HostData, UserData } from '../types'
import { useHostConnection, DEBUG_MODE } from '../utils/peerUtils'
import { UserCard } from './UserCard'
import { useStorage } from '../utils/storage'
import { CountdownTimer } from './CountdownTimer'
import { CardSelector } from './CardSelector'
import { LinkifiedText } from './LinkifiedText'
import { VoteStats } from './VoteStats'
import { CatThrowManager } from './CatThrow'

export const ParticipantView = ({ joinId }: { joinId: string }) => {
  const [name, setName] = useStorage('name', '')
  const [vote, setVote] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [debugRevealed, setDebugRevealed] = useState(false)

  // Cat throw state
  const [catThrowEvents, setCatThrowEvents] = useState<CatThrowEvent[]>([])
  const processedCatThrows = useRef<Set<string>>(new Set())
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  const { data, sendData, connected } = useHostConnection<HostData, UserData>(
    joinId
  )

  // Watch for incoming cat throws from host
  useEffect(() => {
    if (data?.catThrow) {
      const event = data.catThrow
      if (!processedCatThrows.current.has(event.id)) {
        processedCatThrows.current.add(event.id)
        setCatThrowEvents((prev) => [...prev, event])
      }
    }
  }, [data?.catThrow])

  // Function to throw a cat (participant)
  const throwCat = useCallback(
    (targetName: string) => {
      const event: CatThrowEvent = {
        id: `${name}-${Date.now()}-${Math.random()}`,
        targetName,
        fromName: name,
        timestamp: Date.now(),
      }
      processedCatThrows.current.add(event.id)
      setCatThrowEvents((prev) => [...prev, event])
      sendData({ catThrow: event })
    },
    [name, sendData]
  )

  // Get ref for a target by name
  const getTargetRef = useCallback((targetName: string) => {
    const element = cardRefs.current.get(targetName)
    return element ? { current: element } : null
  }, [])

  // Remove completed cat throw event
  const handleCatThrowComplete = useCallback((id: string) => {
    setCatThrowEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  useEffect(
    function updateTitle() {
      window.document.title = data?.sessionName || 'Pointing Poker'
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

  const isRevealed = data?.revealed === true || (DEBUG_MODE && debugRevealed)

  // Combine host's cards with participant's own vote for display
  const allVotes = useMemo(() => {
    const hostCards = data?.cards || []
    if (vote && !hostCards.includes(vote)) {
      return [...hostCards, vote]
    }
    return hostCards
  }, [data?.cards, vote])

  const voteStatus = vote
    ? isRevealed
      ? `Your vote: ${vote}`
      : `Voted: ${vote}`
    : 'Select your card'

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <p className="text-lg font-medium text-slate-300">
          Connecting to host...
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      {/* Header */}
      <h1 className="text-3xl font-black text-center py-3 tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex-shrink-0">
        Pointing Poker{data?.sessionName && ` — ${data.sessionName}`}
      </h1>

      {!isModalOpen ? (
        <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-36">
          <div className="flex items-center justify-end">
            <p className="text-sm text-slate-400">{`Welcome, ${name}!`}</p>
          </div>
          {data?.details && (
            <div className="text-sm text-slate-300 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-slate-400">Details: </span>
              <LinkifiedText text={data.details} />
            </div>
          )}

          <div className="flex justify-between items-center pb-3 border-b border-slate-700">
            <p className="text-sm font-medium text-slate-300">
              Round:{' '}
              <span className="font-bold text-white">{data?.round || 1}</span>
            </p>

            <div className="flex justify-center items-center">
              {data?.countdownPaused ? (
                <div className="text-slate-400 text-sm">Timer Paused</div>
              ) : data?.countdownStartTimestamp !== null &&
                data?.timeLimitSeconds !== undefined ? (
                <CountdownTimer
                  durationSeconds={data.timeLimitSeconds}
                  startTimestamp={data?.countdownStartTimestamp ?? null}
                />
              ) : (
                <div className="text-lg font-semibold text-slate-500">
                  Timer Stopped
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-4">
            <p
              className={`text-lg font-bold transition-colors duration-300 ${
                vote ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              {voteStatus}
            </p>
          </div>

          {/* Vote Summary when revealed */}
          {isRevealed && allVotes.length > 0 && data?.options && (
            <div className="flex justify-center mb-4">
              <VoteStats votes={allVotes} options={data.options} />
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {isRevealed
              ? // Show shuffled votes after reveal with no names
                allVotes.map((voteContent, i) => (
                  <UserCard
                    key={i}
                    userName=""
                    content={voteContent}
                    isRevealed={true}
                  />
                ))
              : // Show vote status before reveal
                data?.hasVoted?.map((voted, i) => {
                  const userName =
                    data?.userNames?.[i] || `Participant ${i + 1}`
                  return (
                    <UserCard
                      key={i}
                      ref={(el) => {
                        cardRefs.current.set(userName, el)
                      }}
                      userName={userName}
                      content={voted ? 'voted' : null}
                      isRevealed={false}
                      onClick={!voted ? () => throwCat(userName) : undefined}
                    />
                  )
                })}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors text-sm font-medium"
              onClick={() => chooseCard('')}
            >
              Clear choice
            </button>
            {DEBUG_MODE && (
              <button
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  debugRevealed
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-600 text-white hover:bg-slate-500'
                }`}
                onClick={() => setDebugRevealed(!debugRevealed)}
              >
                {debugRevealed ? 'Hide Reveal' : 'Preview Reveal'}
              </button>
            )}
          </div>

          {/* Cat throw animations */}
          <CatThrowManager
            events={catThrowEvents}
            getTargetRef={getTargetRef}
            onEventComplete={handleCatThrowComplete}
          />
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
                  <DialogPanel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium leading-6 text-white"
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
                      <label className="block mb-2 text-sm font-medium text-slate-300">
                        Name:
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="block w-full px-3 py-2 mt-1 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                          defaultValue={name}
                        />
                      </label>
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-colors"
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
