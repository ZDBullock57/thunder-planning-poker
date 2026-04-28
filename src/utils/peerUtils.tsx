import { type DataConnection, Peer, type PeerOptions } from 'peerjs'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

/*
  Context, hooks, and various utilities for managing PeerJS connections with the goal
  of not needing to directly interact with PeerJS in React components.
*/

// Debug mode flag - when true, skips peer server and uses mock data
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true'

// Metered.ca REST API credentials from environment variables.
// The API key is used to fetch temporary TURN credentials at runtime.
const METERED_API_KEY = import.meta.env.VITE_METERED_API_KEY as string | undefined
const METERED_DOMAIN = import.meta.env.VITE_METERED_DOMAIN as string | undefined

/** Default STUN-only fallback when Metered credentials are unavailable. */
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.relay.metered.ca:80' },
]

/**
 * Fetch temporary TURN credentials from the Metered.ca REST API.
 * Returns short-lived ICE server configs (STUN + TURN/UDP/TCP/TLS).
 * Falls back to STUN-only if the API key or domain is missing.
 */
const getIceServers = async (): Promise<RTCIceServer[]> => {
  if (!METERED_API_KEY || !METERED_DOMAIN) {
    console.warn('Metered API key or domain not set — falling back to STUN-only')
    return FALLBACK_ICE_SERVERS
  }

  try {
    const response = await fetch(
      `https://${METERED_DOMAIN}/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`Metered API returned ${response.status}`)
    }
    const iceServers: RTCIceServer[] = await response.json()
    console.log('Fetched Metered TURN credentials:', iceServers.length, 'servers')
    return iceServers
  } catch (error) {
    console.error('Failed to fetch Metered TURN credentials, falling back to STUN-only:', error)
    return FALLBACK_ICE_SERVERS
  }
}

export const PeerContext = createContext<Peer | null>(null)
export const usePeerContext = () => useContext(PeerContext)

const usePeer = (options: PeerOptions = {}) => {
  const [peer, setPeer] = useState<Peer | null>(null)

  useEffect(() => {
    let destroyed = false
    let peerInstance: Peer | null = null

    const initPeer = async () => {
      if (destroyed) return
      const iceServers = await getIceServers()

      const peerOptions: PeerOptions = {
        ...options,
        config: {
          iceServers,
          ...options.config,
        },
      }
      peerInstance = new Peer(peerOptions)
      peerInstance.on('error', console.error)
      peerInstance.on('open', (id) => {
        console.log('Connected to PeerJS server and got ID', id)
        console.log('ICE servers configured:', peerOptions.config?.iceServers?.length ?? 0)
        setPeer(peerInstance)
      })
    }

    initPeer()

    return () => {
      destroyed = true
      peerInstance?.destroy()
    }
  }, [])

  return peer
}

export const PeerProvider = ({
  children,
  options,
  fallback,
}: {
  children: React.ReactNode
  options?: PeerOptions
  fallback?: React.ReactNode
}) => {
  const peer = usePeer(options)

  // In debug mode, skip peer connection entirely
  if (DEBUG_MODE) {
    console.log('🔧 Debug mode: Skipping peer server connection')
    return <PeerContext value={null}>{children}</PeerContext>
  }

  return <PeerContext value={peer}>{peer ? children : fallback}</PeerContext>
}

export const usePeerId = () => {
  // In debug mode, return a fake peer ID
  if (DEBUG_MODE) return 'debug-host-id'
  const peer = usePeerContext()
  return peer?.id ?? null
}

// Mock data for debug mode
const MOCK_PARTICIPANT_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana']

// Generate mock votes based on current deck options
const generateMockParticipants = (options: string[]) => {
  // Pick votes from available options (some participants don't vote)
  const validOptions = options.filter(o => o !== '?' && o !== '☕')
  return MOCK_PARTICIPANT_NAMES.map((name, i) => ({
    name,
    // Charlie (index 2) hasn't voted yet, others pick from options
    vote: i === 2 ? null : validOptions[i % validOptions.length] || options[0],
  }))
}

export const useHostConnection = <T, K>(joinId: string) => {
  const peer = usePeerContext()
  const [connection, setConnection] = useState<DataConnection>()
  const [data, setData] = useState<T | null>(null)

  const connectionRef = useRef(connection)
  connectionRef.current = connection

  const sendData = useCallback(
    (data: K) => {
      if (DEBUG_MODE) {
        console.log('🔧 Debug mode: Would send to host:', data)
        return
      }
      connectionRef.current?.send(data)
    },
    []
  )

  useEffect(() => {
    // In debug mode, simulate being connected with mock host data
    if (DEBUG_MODE) {
      console.log('🔧 Debug mode: Simulating host connection')
      const mockOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?']
      const mockParticipants = generateMockParticipants(mockOptions)
      const mockHostData = {
        sessionName: 'Debug Session',
        details: 'https://app.clickup.com/t/debug123 - Test ticket for UI development',
        round: 1,
        options: mockOptions,
        timeLimitSeconds: 120,
        countdownStartTimestamp: null,
        countdownPaused: true,
        revealed: false,
        cards: mockParticipants.map(p => p.vote).filter(Boolean), // Mock revealed cards
        userNames: mockParticipants.map(p => p.name),
        hasVoted: mockParticipants.map(p => p.vote !== null),
      } as T
      setData(mockHostData)
      return
    }

    if (!peer) return
    const connection = peer.connect(joinId)
    console.log('connected to host')
    connection.on('open', () => {
      console.log('host connection open')
      setConnection(connection)

      connection.on('data', (data: any) => {
        console.log('Received data from host', data)
        setData((current) => ({ ...current, ...data }))
      })
    })
    return () => connection.close()
  }, [peer, joinId])

  return { data, sendData, connected: DEBUG_MODE || !!connection }
}

export const useClientConnections = <T, K>(options?: string[]) => {
  const peer = usePeerContext()
  const [connectionDataMap, setConnectionDataMap] = useState<
    Map<DataConnection, T>
  >(new Map())

  const connectionDataMapRef = useRef(connectionDataMap)
  connectionDataMapRef.current = connectionDataMap

  const sendData = useCallback(
    (data: K) => {
      if (DEBUG_MODE) {
        console.log('🔧 Debug mode: Would broadcast to clients:', data)
        return
      }
      connectionDataMapRef.current.forEach((_, connection) => {
        connection.send(data)
      })
    },
    []
  )

  useEffect(() => {
    if (DEBUG_MODE) return
    if (!peer) return
    peer.on('connection', (connection) => {
      console.log('user connected:', connection.peer)
      connection.on('close', () => {
        console.log('user disconnected:', connection.peer)
        setConnectionDataMap((current) => {
          const next = new Map(current)
          next.delete(connection)
          return next
        })
      })
      connection.on('data', (data: any) => {
        console.log('Received user data', data)
        setConnectionDataMap((current) => {
          const next = new Map(current)
          next.set(connection, { ...next.get(connection), ...data })
          return next
        })
      })
    })
  }, [peer])

  // Generate debug data reactively based on options
  const debugData = useMemo(() => {
    if (!DEBUG_MODE) return []
    const mockOptions = options || ['0', '1', '2', '3', '5', '8', '13', '21', '?']
    return generateMockParticipants(mockOptions) as T[]
  }, [options])

  const data = useMemo(() => {
    if (DEBUG_MODE) return debugData
    const records: T[] = []
    connectionDataMap.forEach((data) => {
      records.push(data)
    })
    return records
  }, [connectionDataMap, debugData])

  return { data, sendData }
}
