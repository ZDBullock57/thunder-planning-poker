import '../index.css'
import { HostView } from './components/HostView'
import { ParticipantView } from './components/ParticipantView'
import { PeerProvider } from './utils/peerUtils'

export const App = () => {
  const search = new URLSearchParams(window.location.search)
  const joinId = search.get('join_id')

  return (
    <PeerProvider
      options={import.meta.env.DEV ? { host: 'localhost', port: 9000 } : {}}
      fallback="Connecting to peer server..."
    >      
    <div className="min-h-screen bg-gray-100 font-sans">

     <h1 className="text-5xl font-black text-center py-6 tracking-tight text-gray-800">
      Where’s the Lamb Sauce?
     </h1>
      {joinId ? <ParticipantView joinId={joinId} /> : <HostView />}
    </div>
    </PeerProvider>
  )
}