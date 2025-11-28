import { useEffect, useMemo, useState } from 'react'
import type { HostData, UserData } from '../types'
import { useClientConnections, usePeerId } from '../utils/peerUtils'
import { RevealButton } from './RevealButton'
import { UserCard } from './UserCard'
import { useStorage } from '../utils/storage'
import { DEFAULT_POKER_VALUES } from '../utils/utils'
import { CountdownTimer } from './CountdownTimer'

export const HostView = () => {
  const [sessionName, setSessionName] = useState('')
  const [details, setDetails] = useState('')
  const [round, setRound] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [options, setOptions] = useStorage('options', DEFAULT_POKER_VALUES)
  const [timeLimitSeconds] = useState(120) 
  const [countdownStartTimestamp, setCountdownStartTimestamp] = useState<number | null>(null)

  const peerId = usePeerId()
  const { data, sendData } = useClientConnections<UserData, HostData>()

  useEffect(
    function autoReveal() {
      if (data.length && data.every((user) => user.vote)) {
        setRevealed(true)
        setCountdownStartTimestamp(null)
      }
    },
    [data]
  )

  const cards = useMemo(
    () =>
      data.reduce((acc, user) => {
        if (user.name) {
          acc.push(
            (revealed
              ? user.vote
              : `${user.name} ${user.vote ? '✔️' : '⏳'}`) ?? null
          )
        }
        return acc
      }, [] as (string | null)[]),
    [data, revealed]
  )

  useEffect(
    function syncClients() {
      const hostData: HostData = {
        cards,
        details,
        sessionName,
        round,
        options,
        timeLimitSeconds,
        countdownStartTimestamp,
      }
      sendData(hostData)
    
    },
    [cards, details, sessionName, round, sendData, options,     timeLimitSeconds, countdownStartTimestamp,]
  )


    const handleTimerEnd = () => {
      setRevealed(true)
      setCountdownStartTimestamp(null) 
    }
    

    useEffect(() => {
      // Only start the timer if a session name exists and the timer is not running
      if (sessionName && countdownStartTimestamp === null) {
        setCountdownStartTimestamp(Date.now())
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionName])

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
        {countdownStartTimestamp !== null && !revealed ? ( 
          <CountdownTimer
            durationSeconds={timeLimitSeconds}
            startTimestamp={countdownStartTimestamp}
            onTimerEnd={handleTimerEnd} 
          />
        ) : (
          <div className="text-2xl font-semibold text-green-600 py-2">
            Vote Closed
          </div>
        )}
      </div>
      <CopyButton
        text={new URL(window.location.href + '?join_id=' + peerId).href}
      >
        Copy join link 📋
      </CopyButton>

      <label className="block text-gray-700 text-sm font-bold w-full">
        Voting options (one per line)
        <textarea
          className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={options.join('\n')}
          onBlur={(e) => {
            setOptions(
              e.target.value
                .split(/[\r\n]+/)
                .map((v) => v.trim())
                .filter((v) => v.length > 0)
            )
          }}
        />
      </label>

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

      <div className="mt-6">
        {/* List users */}
        {cards.map((content, i) => {
          return <UserCard key={i} userName={content ?? ''} />
        })}
      </div>

      <button
        className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
        onClick={() => {
          setRevealed(false)
          setRound((prev) => prev + 1)
          setCountdownStartTimestamp(Date.now()) 
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
      {showCopied ? 'Copied!' : children ?? 'Copy'}
    </button>
  )
}
