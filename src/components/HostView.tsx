import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { CatThrowEvent, HostData, UserData } from '../types'
import { useClientConnections, usePeerId } from '../utils/peerUtils'
import { RevealButton } from './RevealButton'
import { UserCard } from './UserCard'
import { useStorage } from '../utils/storage'
import { CountdownTimer } from './CountdownTimer'
import {
  DEFAULT_DECK_KEY,
  CARD_DECKS,
  DECK_OPTIONS,
} from '../utils/utils'
import { VoteStats } from './VoteStats'
import { LinkifiedText } from './LinkifiedText'
import { ClockIcon, PlayIcon, PauseIcon, CheckIcon, CopyIcon } from './Icons'
import { CatThrowManager } from './CatThrow'


export const HostView = () => {
  const [sessionName, setSessionName] = useState('')
  const [details, setDetails] = useState('')
  const [round, setRound] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [autoReveal, setAutoReveal] = useState(false)
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
  const [deckExpanded, setDeckExpanded] = useState(false)

  // Cat throw state
  const [catThrowEvents, setCatThrowEvents] = useState<CatThrowEvent[]>([])
  const processedCatThrows = useRef<Set<string>>(new Set())
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  // Compute options before using in hook
  const options = useMemo(() =>
    deckKey === DECK_OPTIONS.CUSTOM_DECK_KEY
      ? customOptions
      : CARD_DECKS[deckKey] || CARD_DECKS[DEFAULT_DECK_KEY],
    [deckKey, customOptions]
  )

  const peerId = usePeerId()
  const { data, sendData } = useClientConnections<UserData, HostData>(options)

  // Watch for incoming cat throws from participants and forward them
  useEffect(() => {
    data.forEach((user) => {
      if (user.catThrow) {
        const event = user.catThrow
        // Skip if already processed
        if (processedCatThrows.current.has(event.id)) return
        processedCatThrows.current.add(event.id)
        // Add to local events and broadcast
        setCatThrowEvents(prev => [...prev, event])
        sendData({ catThrow: event })
      }
    })
  }, [data, sendData])

  // Function to throw a cat (host)
  const throwCat = useCallback((targetName: string) => {
    const event: CatThrowEvent = {
      id: `host-${Date.now()}-${Math.random()}`,
      targetName,
      fromName: 'Host',
      timestamp: Date.now(),
    }
    processedCatThrows.current.add(event.id)
    setCatThrowEvents(prev => [...prev, event])
    sendData({ catThrow: event })
  }, [sendData])

  // Get ref for a target by name
  const getTargetRef = useCallback((name: string) => {
    const element = cardRefs.current.get(name)
    return element ? { current: element } : null
  }, [])

  // Remove completed cat throw event
  const handleCatThrowComplete = useCallback((id: string) => {
    setCatThrowEvents(prev => prev.filter(e => e.id !== id))
  }, [])

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
    () => userStatusList.map((u) => u.vote),
    [userStatusList]
  )
  const hasVoted = useMemo(
    () => userStatusList.map((u) => u.vote !== null && u.vote !== ''),
    [userStatusList]
  )

  const shuffledVotes = useMemo(() => {
    if (!revealed) return []
    const votes = [...userVotes]
    for (let i = votes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[votes[i], votes[j]] = [votes[j], votes[i]]
    }
    return votes
  }, [userVotes, revealed])

  // Auto-reveal when all votes are in (if enabled)
  useEffect(
    function handleAutoReveal() {
      if (autoReveal && data.length && data.every((user) => user.vote) && !revealed) {
        setRevealed(true)
        setCountdownStartTimestamp(null)
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      }
    },
    [autoReveal, data, revealed]
  )

  // Sync host-owned data: only fires when the host makes a change
  useEffect(
    function syncHostData() {
      sendData({
        sessionName,
        details,
        round,
        options,
        timeLimitSeconds,
        countdownStartTimestamp,
        countdownPaused,
        revealed,
        cards: revealed ? shuffledVotes : [],
      })
    },
    [
      sendData,
      sessionName,
      details,
      round,
      options,
      timeLimitSeconds,
      countdownStartTimestamp,
      countdownPaused,
      revealed,
      shuffledVotes,
    ]
  )

  // Sync user-derived data: only fires when participant data changes
  useEffect(
    function syncUserData() {
      sendData({ userNames, hasVoted })
    },
    [sendData, userNames, hasVoted]
  )

  const handleTimerEnd = () => {
    setRevealed(true)
    setCountdownStartTimestamp(null)
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <form
        className="bg-slate-800 shadow-xl rounded-xl p-6 w-full max-w-md border border-slate-700"
        action={(formData) => {
          const sessionName = formData.get('sessionName') as string
          if (!sessionName.trim()) return
          setSessionName(sessionName)
          window.document.title = sessionName
          setCountdownStartTimestamp(Date.now())
        }}
      >
        <label className="block text-slate-200 text-sm font-bold mb-2">
          Enter a name for your session:
          <input
            name="sessionName"
            className="mt-2 block w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </label>

        <button
          type="submit"
          className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Create
        </button>
      </form>
    </div>
  ) : (
    <div className="px-4 py-3 bg-slate-900 h-screen flex flex-col">
      {/* Header */}
      <h1 className="text-3xl font-black text-center py-3 tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Pointing Poker{sessionName && ` — ${sessionName}`}
      </h1>
      
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Sidebar - Settings */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Host Controls</h2>
          {/* Session info */}
          <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
            <CopyButton
              text={new URL(window.location.href + '?join_id=' + peerId).href}
            >
              <span className="flex items-center gap-1.5">Copy join link <CopyIcon size={12} /></span>
            </CopyButton>
          </div>

        {/* Deck Settings */}
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center justify-between text-slate-300 text-xs font-medium uppercase tracking-wide"
            onClick={() => setDeckExpanded(!deckExpanded)}
          >
            <span>Deck</span>
            <span className="text-slate-500 text-xs normal-case">{deckExpanded ? 'Hide' : 'Edit'}</span>
          </button>
          <select
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={deckKey}
            onChange={(e) => {
              const newKey = e.target.value as keyof typeof CARD_DECKS
              setDeckKey(newKey)
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
          {deckExpanded && (
            <textarea
              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={optionsInput}
              onChange={(e) => setOptionsInput(e.target.value)}
              onBlur={(e) => handleOptionsUpdate(e.target.value)}
              rows={5}
              placeholder="Values..."
            />
          )}
        </div>

        {/* Voting Controls */}
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex flex-col gap-2">
          {/* Vote Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {revealed ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckIcon size={12} /> Revealed</span>
              ) : (
                `${userStatusList.filter(u => u.vote).length}/${userStatusList.length} voted`
              )}
            </span>
            {/* Timer inline */}
            {countdownPaused ? (
              <div className="flex items-center gap-1">
                <ClockIcon className="text-slate-500" size={12} />
                <input
                  type="number"
                  min={10}
                  step={1}
                  defaultValue={timeLimitSeconds}
                  onBlur={(e) => setTimeLimitSeconds(Number(e.target.value))}
                  className="w-12 text-center px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                />
                <span className="text-slate-500 text-xs">s</span>
                <button
                  className="px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-500 flex items-center justify-center"
                  onClick={() => {
                    setCountdownPaused(false)
                    setCountdownStartTimestamp(Date.now())
                  }}
                >
                  <PlayIcon size={10} />
                </button>
              </div>
            ) : (
              countdownStartTimestamp !== null && !revealed && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="text-slate-500" size={12} />
                  <CountdownTimer
                    durationSeconds={timeLimitSeconds}
                    startTimestamp={countdownStartTimestamp}
                    onTimerEnd={handleTimerEnd}
                  />
                  <button
                    className="px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-500 flex items-center justify-center"
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
                    <PauseIcon size={10} />
                  </button>
                </div>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              className="flex-1 bg-indigo-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-indigo-500 transition-colors text-sm"
              onClick={() => {
                setRevealed(true)
                setCountdownStartTimestamp(null)
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
              }}
            >
              Reveal
            </button>
            <button
              className="flex-1 bg-emerald-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-emerald-500 transition-colors text-sm"
              onClick={() => {
                setRevealed(false)
                setRound((prev) => prev + 1)
                setCountdownPaused(true)
                setTimeLimitSeconds(120)
              }}
            >
              New Round
            </button>
          </div>

          {/* Auto-reveal */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
            <input
              type="checkbox"
              checked={autoReveal}
              onChange={(e) => setAutoReveal(e.target.checked)}
              className="w-3 h-3 text-indigo-600 bg-slate-700 border-slate-500 rounded focus:ring-indigo-500"
            />
            Auto-reveal when all voted
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session</h2>
        {/* Details card */}
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
          <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">
            Details
          </label>
          <textarea
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            placeholder="Paste ticket link or description..."
            defaultValue={details}
            onBlur={(e) => setDetails(e.target.value)}
          />
          {details && (
            <div className="mt-2 text-sm text-slate-300">
              <LinkifiedText text={details} />
            </div>
          )}
        </div>

        {/* Participant cards area */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col">
          {/* Vote Summary when revealed */}
          {revealed && (
            <div className="flex justify-center mb-4">
              <VoteStats votes={userVotes} options={options} />
            </div>
          )}
          
          {/* Cards */}
          <div className="flex flex-wrap justify-center gap-3">
            {revealed ? (
              shuffledVotes.map((vote, i) => (
                <UserCard key={i} userName="" content={vote} isRevealed={true} />
              ))
            ) : (
              userStatusList.map((user, i) => {
                const hasVoted = user.vote !== null && user.vote !== ''
                return (
                  <UserCard
                    key={i}
                    ref={(el) => {
                      if (user.name) cardRefs.current.set(user.name, el)
                    }}
                    userName={user.name ?? ''}
                    content={user.vote}
                    isRevealed={false}
                    onClick={!hasVoted && user.name ? () => throwCat(user.name!) : undefined}
                  />
                )
              })
            )}
            {userStatusList.length === 0 && (
              <p className="text-slate-500 text-sm">Waiting for participants to join...</p>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Cat throw animations */}
      <CatThrowManager
        events={catThrowEvents}
        getTargetRef={getTargetRef}
        onEventComplete={handleCatThrowComplete}
      />
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
      className="w-full bg-indigo-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-indigo-500 transition-colors text-sm"
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

const buttonStyles = `bg-indigo-600 text-white py-1.5 px-4 rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium`
