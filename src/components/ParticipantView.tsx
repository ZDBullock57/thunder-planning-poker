import { useState } from 'react'
import { AllCards, Card } from './Card'
import { useHostConnection } from '../utils/peerUtils'
import type { HostData, UserData } from '../types'
import { UserCard } from './UserCard'

export const ParticipantView = ({ joinId }: { joinId: string }) => {
  const [name, setName] = useState('')
  const [card, setCard] = useState('')

  const { data, sendData, connected } = useHostConnection<HostData, UserData>(
    joinId
  )
  const chooseCard = (value: string) => {
    setCard(value)
    sendData({ vote: value })
  }

  if (!connected) return 'Connecting to host...'
  return (
    <>
      {!!name ? (
        <>
          <h2>{data?.sessionName}</h2>
          <p>{`Welcome, ${name}!`}</p>
          <pre>
            {data?.details || '(Host has not provided any details yet)'}
          </pre>
          {data?.cards?.map((content, i) => {
            return <UserCard key={i} userName={content ?? ''} />
          })}
          {card ? <Card value={card} /> : <AllCards chooseCard={chooseCard} />}
          <button
            className="create-button"
            onClick={() => {
              setCard('')
              sendData({ vote: null })
            }}
          >
            Clear choice
          </button>
        </>
      ) : (
        <form
          action={(formData) => {
            const name = formData.get('name') as string
            if (!name.trim()) return
            setName(name)
            sendData({
              name,
            })
          }}
        >
          <label className="text-field">
            Enter your name:
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              required
            />
          </label>

          <button type="submit" className="create-button">
            Submit
          </button>
        </form>
      )}
    </>
  )
}
