import { HostView } from './components/HostView'
import { ParticipantView } from './components/ParticipantView'
import '../index.css'
import { PeerProvider } from './utils/peerUtils'

export const App = () => {
  const search = new URLSearchParams(window.location.search)
  const joinId = search.get('join_id')

  return (
    <PeerProvider
      options={import.meta.env.DEV ? { host: 'localhost', port: 9000 } : {}}
      fallback="Connecting to peer server..."
    >
      <h1 className="title">Where’s the Lamb Sauce?</h1>
      {joinId ? <ParticipantView joinId={joinId} /> : <HostView />}
    </PeerProvider>
  )
}
