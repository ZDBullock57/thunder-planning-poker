import { useEffect, useState } from "react";
import { HostView } from "./components/HostView";
import { ParticipantView } from "./components/ParticipantView";
import { Peer } from "peerjs";
import "../index.css"

export const App = () => {
  const search = new URLSearchParams(window.location.search)
  const joinId = search.get('join_id')

  const [peer] = useState(new Peer())
  const [connection] = useState(joinId && peer.connect(joinId))

  useEffect(() => {
    return () => peer.destroy()
  }, [peer])

  return (
    <>
      <h1 className="title">Where’s the Lamb Sauce?</h1>
      { connection ? <ParticipantView connection={connection} /> : <HostView peer={peer} /> }
    </>
  );
};

