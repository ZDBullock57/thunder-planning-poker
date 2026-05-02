import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DataConnection } from "peerjs"
import { usePeerContext } from "../contexts/PeerContext"
import { DEBUG_MODE } from "../constants"

export const usePeerId = () => {
  const peer = usePeerContext()
  return peer?.id ?? 'debug-host-id'
}

export const useHostConnection = <T, K>(joinId: string) => {
  const peer = usePeerContext()
  const [connection, setConnection] = useState<DataConnection>()
  const [data, setData] = useState<T | null>(null)

  const connectionRef = useRef(connection)
  connectionRef.current = connection

  const sendData = useCallback((data: K) => {
    if (DEBUG_MODE) {
      console.log('🔧 Debug mode: Would send to host:', data)
      return
    }
    connectionRef.current?.send(data)
  }, [])

  useEffect(() => {
    // In debug mode, simulate being connected with mock host data
    if (DEBUG_MODE) {
      console.log('🔧 Debug mode: Simulating host connection')
      const mockOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?']
      const mockParticipants = generateMockParticipants(mockOptions)
      const mockHostData = {
        sessionName: 'Debug Session',
        details:
          'https://app.clickup.com/t/debug123 - Test ticket for UI development',
        round: 1,
        options: mockOptions,
        timeLimitSeconds: 120,
        countdownStartTimestamp: null,
        countdownPaused: true,
        revealed: false,
        cards: mockParticipants.map((p) => p.vote).filter(Boolean), // Mock revealed cards
        userNames: mockParticipants.map((p) => p.name),
        hasVoted: mockParticipants.map((p) => p.vote !== null),
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

      connection.on('data', (d: unknown) => {
        const data = d as T
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

  const sendData = useCallback((data: K) => {
    if (DEBUG_MODE) {
      console.log('🔧 Debug mode: Would broadcast to clients:', data)
      return
    }
    connectionDataMapRef.current.forEach((_, connection) => {
      connection.send(data)
    })
  }, [])

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
      connection.on('data', (d: unknown) => {
        const data = d as T
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
    const mockOptions = options || [
      '0',
      '1',
      '2',
      '3',
      '5',
      '8',
      '13',
      '21',
      '?',
    ]
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

// Mock data for debug mode
const MOCK_PARTICIPANT_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana']

// Generate mock votes based on current deck options
const generateMockParticipants = (options: string[]) => {
  // Pick votes from available options (some participants don't vote)
  const validOptions = options.filter((o) => o !== '?' && o !== '☕')
  return MOCK_PARTICIPANT_NAMES.map((name, i) => ({
    name,
    // Charlie (index 2) hasn't voted yet, others pick from options
    vote: i === 2 ? null : validOptions[i % validOptions.length] || options[0],
  }))
}