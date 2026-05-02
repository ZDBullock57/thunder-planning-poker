import '../index.css'
import { HostView } from './components/HostView'
import { ParticipantView } from './components/ParticipantView'
import { PeerProvider } from './components/PeerProvider'

// Debug mode configuration
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true'
const DEBUG_ROLE = import.meta.env.VITE_DEBUG_ROLE as
  | 'host'
  | 'participant'
  | undefined

export const App = () => {
  const search = new URLSearchParams(window.location.search)
  const joinId = search.get('join_id')

  // In debug mode, use the role from env var; otherwise use URL-based detection
  const isParticipant =
    DEBUG_MODE && DEBUG_ROLE ? DEBUG_ROLE === 'participant' : !!joinId

  return (
    <PeerProvider
      options={import.meta.env.DEV ? { host: 'localhost', port: 9000 } : {}}
      fallback="Connecting to peer server..."
    >
      <div className="min-h-screen bg-slate-900 font-sans">
        {isParticipant ? (
          <ParticipantView joinId={joinId || 'debug-session'} />
        ) : (
          <HostView />
        )}
      </div>
    </PeerProvider>
  )
}
