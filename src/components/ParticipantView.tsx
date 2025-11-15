import { useState, useEffect } from 'react'
import { AllCards, Card } from './Card'
import { type DataConnection, Peer } from 'peerjs'

export const ParticipantView = ({
  peer,
  joinId,
}: {
  peer: Peer
  joinId: string
}) => {
  const [name, setName] = useState('')
  const [card, setCard] = useState('')
  const chooseCard = (value: string) => {
    setCard(value)
    connection?.send({ vote: value })
  }

  const [connection, setConnection] = useState<DataConnection>()
  useEffect(() => {
    const connection = peer.connect(joinId)
    console.log('connected to host')
    connection.on('open', () => {
      console.log('host connection open')
      setConnection(connection)

      connection.on('data', (data) => {
        console.log('Received data from host', data)
        // TODO: Accept host data and update local state
      })
    })
  }, [peer, joinId])

  if (!connection) return 'Connecting to host...'

  return (
    <>
      {!!name ? (
        <>
          <h1>{`Welcome, ${name}`}</h1>
          {card ? <Card value={card} /> : <AllCards chooseCard={chooseCard} />}
          <button
            className="create-button"
            onClick={() => {
              setCard('')
              connection.send({ vote: null })
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
            connection.send({
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
