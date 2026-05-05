import type Peer from "peerjs";
import { createContext, useContext } from "react";

export const PeerContext = createContext<Peer | null>(null)

export const usePeerContext = () => useContext(PeerContext)
