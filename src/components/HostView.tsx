import { useEffect, useMemo, useState } from 'react'
import type { HostData, UserData } from '../types'
import { useClientConnections, usePeerId } from '../utils/peerUtils'
import { RevealButton } from './RevealButton'
import { UserCard } from './UserCard'
import { useStorage } from '../utils/storage'
import { CountdownTimer } from './CountdownTimer'
import { DEFAULT_DECK_KEY, CARD_DECKS, DECK_OPTIONS } from '../utils/utils'

export const HostView = () => {
  const [sessionName, setSessionName] = useState('')
  const [details, setDetails] = useState('')
  const [round, setRound] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [deckKey, setDeckKey] = useStorage<keyof typeof CARD_DECKS>(
    'deckKey',
    DEFAULT_DECK_KEY
  )
  const [customOptions, setCustomOptions] = useStorage<string[]>(
    'customDeckOptions',
    CARD_DECKS[DEFAULT_DECK_KEY]
  )

  const [optionsInput, setOptionsInput] = useState(() =>
    customOptions.join('\n')
  )
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(120)
  const [countdownPaused, setCountdownPaused] = useState(true)
  const [countdownStartTimestamp, setCountdownStartTimestamp] = useState<
    number | null
  >(null)

  const peerId = usePeerId()
  const { data, sendData } = useClientConnections<UserData, HostData>()

  const options =
    deckKey === DECK_OPTIONS.CUSTOM_DECK_KEY
      ? customOptions
      : CARD_DECKS[deckKey] || CARD_DECKS[DEFAULT_DECK_KEY]

  const userStatusList = useMemo(() => {
    return data
      .filter((user): user is UserData => !!user.name)
      .map((user) => ({
        name: user.name ?? null,
        vote: user.vote ?? null,
      }))
  }, [data])

  const userNames = useMemo(
    () => userStatusList.map((u) => u.name),
    [userStatusList]
  )
  const userVotes = useMemo(
    () => userStatusList.map((u) => (revealed ? u.vote : null)),
    [userStatusList, revealed]
  )

  useEffect(
    function autoReveal() {
      if (data.length && data.every((user) => user.vote)) {
        setRevealed(true)
        setCountdownStartTimestamp(null)
      }
    },
    [data]
  )

  useEffect(
    function syncClients() {
      const hostData: HostData = {
        cards: userVotes,
        userNames: userNames,
        details,
        sessionName,
        round,
        options,
        timeLimitSeconds,
        countdownStartTimestamp,
        countdownPaused,
      }
      sendData(hostData)
    },
    [
      userVotes,
      details,
      sessionName,
      round,
      sendData,
      options,
      timeLimitSeconds,
      countdownStartTimestamp,
      userNames,
      countdownPaused,
    ]
  )

  const handleTimerEnd = () => {
    setRevealed(true)
    setCountdownStartTimestamp(null)
  }

  const handleOptionsUpdate = (text: string) => {
    setOptionsInput(text)

    const newOptionsArray = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (deckKey === DECK_OPTIONS.CUSTOM_DECK_KEY) {
      setCustomOptions(newOptionsArray)
    }
  }

  useEffect(() => {
    if (deckKey === DECK_OPTIONS.CUSTOM_DECK_KEY) {
      // Use whatever is currently stored in customOptions
      setOptionsInput(customOptions.join('\n'))
    } else {
      const newOptions = CARD_DECKS[deckKey] || CARD_DECKS[DEFAULT_DECK_KEY]
      // For built-in decks, we only update the input, not the stored custom deck
      setOptionsInput(newOptions.join('\n'))
    }
    setRevealed(false)
    setCountdownStartTimestamp(null)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckKey])

  return !sessionName ? (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
        action={(formData) => {
          const sessionName = formData.get('sessionName') as string
          if (!sessionName.trim()) return
          setSessionName(sessionName)
          window.document.title = sessionName
          setCountdownStartTimestamp(Date.now())
        }}
      >
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Enter a name for your session:
          <input
            name="sessionName"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
        >
          Create
        </button>
      </form>
    </div>
  ) : (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col gap-4 items-start">
      <h2 className="text-3xl">{sessionName}</h2>
      {/*Timer Display section */}
      <div className="flex justify-center items-center w-full">
        {revealed && (
          <div className="text-2xl font-semibold text-green-600 py-2">
            Vote Closed
          </div>
        )}
        {countdownPaused ? (
          <div className="flex gap-4 items-center">
            <label className="flex gap-2 items-center">
              Timer
              <input
                type="number"
                min={10}
                step={1}
                defaultValue={timeLimitSeconds}
                onBlur={(e) => setTimeLimitSeconds(Number(e.target.value))}
                className="text-right w-20"
              />{' '}
              seconds
            </label>
            <button
              className={buttonStyles}
              onClick={() => {
                setCountdownPaused(false)
                setCountdownStartTimestamp(Date.now())
              }}
            >
              Start ▶️
            </button>
          </div>
        ) : (
          countdownStartTimestamp !== null &&
          !revealed && (
            <div className="flex gap-4 items-center">
              <CountdownTimer
                durationSeconds={timeLimitSeconds}
                startTimestamp={countdownStartTimestamp}
                onTimerEnd={handleTimerEnd}
              />
              <button
                className={buttonStyles}
                onClick={() => {
                  setCountdownPaused(true)
                  setTimeLimitSeconds((prev) => {
                    const now = Date.now()
                    const elapsed = now - (countdownStartTimestamp ?? 0)
                    const remaining = Math.max(0, prev * 1000 - elapsed)
                    return Math.ceil(remaining / 1000)
                  })
                }}
              >
                Pause ⏸️
              </button>
            </div>
          )
        )}
      </div>
      <CopyButton
        text={new URL(window.location.href + '?join_id=' + peerId).href}
      >
        Copy join link 📋
      </CopyButton>
      <div className="w-full">
        <label className="block text-gray-700 text-sm font-bold w-full">
          Voting options (one per line)
          <select
            className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={deckKey}
            onChange={(e) => {
              const newKey = e.target.value as keyof typeof CARD_DECKS
              setDeckKey(newKey)
              // Reset round state here
              setRevealed(false)
              setCountdownStartTimestamp(null)
            }}
          >
            {Object.entries(DECK_OPTIONS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-gray-700 text-sm font-bold w-full mt-3">
          Custom Deck Values (One value per line)
          <textarea
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            value={optionsInput}
            onChange={(e) => handleOptionsUpdate(e.target.value)}
            rows={5}
            placeholder="e.g. 1, 2, 3, 5, 8, 13, 20, ?"
          />
        </label>
      </div>

      <label className="block text-gray-700 text-sm font-bold mb-4 w-full">
        Details
        <textarea
          className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onBlur={(e) => {
            setDetails(e.target.value)
          }}
        />
      </label>

      <RevealButton
        onReveal={() => {
          setRevealed(true)
          setCountdownStartTimestamp(null)
        }}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-4 pb-32">
        {/* List users */}
        {userStatusList.map((user, i) => {
          return (
            <UserCard
              key={i}
              userName={user.name ?? ''}
              content={user.vote}
              isRevealed={revealed}
            />
          )
        })}
      </div>

      <button
        className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
        onClick={() => {
          setRevealed(false)
          setRound((prev) => prev + 1)
          setCountdownPaused(true)
          setTimeLimitSeconds(120)
        }}
      >
        Start new pointing round - we found the lamb sauce
      </button>
    </div>
  )
}

function CopyButton({
  text,
  children,
}: {
  text: string
  children?: React.ReactNode
}) {
  const [showCopied, setShowCopied] = useState(false)
  return (
    <button
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      }}
    >
      {showCopied ? 'Copied!' : (children ?? 'Copy')}
    </button>
  )
}

const buttonStyles = `bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600`
