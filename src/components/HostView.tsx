import { useEffect, useMemo, useState } from 'react'
import { RevealButton } from './RevealButton'
import { UserCard } from './UserCard'
import type { HostData, UserData } from '../types'
import { useClientConnections, usePeerId } from '../utils/peerUtils'

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

  // TODO: Maybe split up into multiple useEffects to prevent re-sending everything on any change?
  useEffect(
    function syncClients() {
      sendData({ cards, details, sessionName, round })
    },
    [cards, details, sessionName, round, sendData]
  )

  return !sessionName ? (
    <>
      <form
        className="create-session"
        action={(formData) => {
          const sessionName = formData.get('sessionName') as string
          if (!sessionName.trim()) return
          setSessionName(sessionName)
        }}
      >
        <label className="text-field">
          Enter a name for your session:
          <input
            name="sessionName"
            className="input-field"
            style={{ width: 'fill' }}
          />
        </label>

        <button type="submit" className="create-button">
          Create
        </button>
      </form>
    </>
  ) : (
    <>
      <CopyButton
        text={new URL(window.location.origin + '?join_id=' + peerId).href}
      >
        Copy join link to clipboard
      </CopyButton>

      <label className="text-field">
        Details
        <textarea
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

      {/* List users */}
      {cards.map((content, i) => {
        return <UserCard key={i} userName={content ?? ''} />
      })}

      <button
        className="create-button"
        onClick={() => {
          setRevealed(false)
          setRound((prev) => prev + 1)
        }}
      >
        Start new pointing round - we found the lamb sauce
      </button>
    </>
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
      className="create-button"
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
