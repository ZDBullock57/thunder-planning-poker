import { useEffect, useMemo, useState } from 'react'
import type { HostData, UserData } from '../types'
import { useClientConnections, usePeerId } from '../utils/peerUtils'
import { RevealButton } from './RevealButton'
import { UserCard } from './UserCard'

export const HostView = () => {
  const [sessionName, setSessionName] = useState('')
  const [details, setDetails] = useState('')
  const [round, setRound] = useState(1)
  const [revealed, setRevealed] = useState(false)

  const peerId = usePeerId()
  const { data, sendData } = useClientConnections<UserData, HostData>()

  useEffect(
    function autoReveal() {
      if (data.length && data.every((user) => user.vote)) {
        setRevealed(true)
      }
    },
    [data]
  )

  const cards = useMemo(
    () =>
      data.reduce((acc, user) => {
        if (user.name) {
          acc.push((revealed ? user.vote : user.name) ?? null)
        }
        return acc
      }, [] as (string | null)[]),
    [data, revealed]
  )

  useEffect(
    function syncClients() {
      sendData({ cards, details, sessionName, round })
    },
    [cards, details, sessionName, round, sendData]
  )

  return !sessionName ? (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
        action={(formData) => {
          const sessionName = formData.get('sessionName') as string
          if (!sessionName.trim()) return
          setSessionName(sessionName)
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
    <div className="p-6 bg-gray-100 min-h-screen ">
      <CopyButton
        text={new URL(window.location.origin + '?join_id=' + peerId).href}
      >
        Copy join link to clipboard
      </CopyButton>

      <label className="block text-gray-700 text-sm font-bold mb-4">
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
      className="m-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
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
