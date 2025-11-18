import { useEffect, useState } from 'react'
import { HostView } from './components/HostView'
import { ParticipantView } from './components/ParticipantView'
import { Peer } from 'peerjs'
import '../index.css'

export const App = () => {
  const search = new URLSearchParams(window.location.search)
  const joinId = search.get('join_id')

  const [peer, setPeer] = useState<Peer | null>(null)

  useEffect(() => {
    // Run local peer server (with npm run serve) during development
    const peer = new Peer(
      import.meta.env.DEV ? { host: 'localhost', port: 9000 } : {}
    )
    peer.on('error', console.error)
    peer.on('open', (id) => {
      console.log('Connected to PeerJS server and got ID', id)
      setPeer(peer)
    })

    return () => peer.destroy()
  }, [])

  return (
    <>
      <h1 className="title">Where’s the Lamb Sauce?</h1>
      {!peer ? (
        'Loading...'
      ) : joinId ? (
        <ParticipantView {...{ peer, joinId }} />
      ) : (
        <HostView peer={peer} />
      )}
    </>
  )
}
