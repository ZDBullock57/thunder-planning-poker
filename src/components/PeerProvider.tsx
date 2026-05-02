import { Peer, type PeerOptions } from 'peerjs'
import { useEffect, useState } from 'react'
import { PeerContext } from '../contexts/PeerContext'
import { DEBUG_MODE } from '../constants'

/*
  Context, hooks, and various utilities for managing PeerJS connections with the goal
  of not needing to directly interact with PeerJS in React components.
*/

// Metered.ca REST API credentials from environment variables.
// The API key is used to fetch temporary TURN credentials at runtime.
const METERED_API_KEY = import.meta.env.VITE_METERED_API_KEY as
  | string
  | undefined
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
    console.warn(
      'Metered API key or domain not set — falling back to STUN-only'
    )
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
    console.log(
      'Fetched Metered TURN credentials:',
      iceServers.length,
      'servers'
    )
    return iceServers
  } catch (error) {
    console.error(
      'Failed to fetch Metered TURN credentials, falling back to STUN-only:',
      error
    )
    return FALLBACK_ICE_SERVERS
  }
}

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
        console.log(
          'ICE servers configured:',
          peerOptions.config?.iceServers?.length ?? 0
        )
        setPeer(peerInstance)
      })
    }

    initPeer()

    return () => {
      destroyed = true
      peerInstance?.destroy()
    }
  }, [options])

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
