import { type DataConnection, Peer, type PeerOptions } from 'peerjs'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/*
  Context, hooks, and various utilities for managing PeerJS connections with the goal
  of not needing to directly interact with PeerJS in React components.
*/

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

  return <PeerContext value={peer}>{peer ? children : fallback}</PeerContext>
}

export const usePeerId = () => {
  const peer = usePeerContext()
  return peer?.id ?? null
}

export const useHostConnection = <T, K>(joinId: string) => {
  const peer = usePeerContext()
  const [connection, setConnection] = useState<DataConnection>()
  const [data, setData] = useState<T | null>(null)

  const sendData = useCallback(
    (data: K) => {
      connection?.send(data)
    },
    [connection]
  )

  useEffect(() => {
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

  return { data, sendData, connected: !!connection }
}

export const useClientConnections = <T, K>() => {
  const peer = usePeerContext()
  const [connectionDataMap, setConnectionDataMap] = useState<
    Map<DataConnection, T>
  >(new Map())

  const sendData = useCallback(
    (data: K) => {
      connectionDataMap.forEach((_, connection) => {
        connection.send(data)
      })
    },
    [connectionDataMap]
  )

  useEffect(() => {
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

  const data = useMemo(() => {
    const records: T[] = []
    connectionDataMap.forEach((data) => {
      records.push(data)
    })
    return records
  }, [connectionDataMap])

  return { data, sendData }
}
