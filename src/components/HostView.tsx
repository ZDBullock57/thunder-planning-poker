import { useState, useEffect } from 'react'
import { Peer } from 'peerjs'
import { RevealButton } from './RevealButton'
import { UserCard } from './UserCard'

type UserData = {
  name?: string
  vote?: string
}

// TODO: Vote context - A description or link to what is being voted on.
//       Host can update this whenever

export const HostView = ({ peer }: { peer: Peer }) => {
  const [sessionName, setSessionName] = useState('')
  const [peerDataMap, setPeerDataMap] = useState<Record<string, UserData>>({})
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    peer.on('connection', (connection) => {
      console.log('user connected')
      connection.on('close', () => {
        // TODO: Delete user? This would happen if the user leaves
      })
      connection.on('data', (data: any) => {
        console.log('Received user data', data)
        setPeerDataMap((current) => ({
          ...current,
          [connection.peer]: { ...current[connection.peer], ...data },
        }))
        // TODO: Update all other users with names, but not votes
      })
    })
  }, [peer])

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
      <button
        className="create-button"
        onClick={() => {
          const url = new URL(window.location.origin + '?join_id=' + peer.id)
          navigator.clipboard
            .writeText(url.href)
            .then(() => alert('Link copied to clipboard!'))
            .catch((err) => {
              console.error('Failed to copy to clipboard', err)
              alert('Failed to copy to clipboard')
            })
        }}
      >
        Copy to clipboard
      </button>

      <RevealButton
        onReveal={() => {
          setRevealed(true)
          // TODO: Send votes to users
        }}
      />

      {/* List users */}
      {Object.values(peerDataMap)
        .filter((user) => user.name)
        .map((user) => {
          return (
            <UserCard
              key={user.name}
              userName={!revealed ? user.name! : user.vote!}
            />
          )
        })}

      <button className="create-button" onClick={() => setRevealed(false)}>
        Start new pointing round - we found the lamb sauce
      </button>
    </>
  )
}
