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

export const PeerContext = createContext<Peer | null>(null)
export const usePeerContext = () => useContext(PeerContext)

const usePeer = (options: PeerOptions = {}) => {
  const [peer, setPeer] = useState<Peer | null>(null)

  useEffect(() => {
    const peer = new Peer(options)
    peer.on('error', console.error)
    peer.on('open', (id) => {
      console.log('Connected to PeerJS server and got ID', id)
      setPeer(peer)
    })

    return () => peer.destroy()
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
    // TODO: cleanup?
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
