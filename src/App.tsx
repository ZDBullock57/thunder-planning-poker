import { DEFAULT_POKER_VALUES } from "./utils/utils";
import { useState } from "react";
import { CreateSession } from "./components/CreateSession"
import { HostView } from "./components/HostView";
import { ParticipantView } from "./components/ParticipantView";
import "../index.css"

// Views:
// - Default (no session, probably going to become a host)
// - Host
// - Joined

type View = "default" | "host" | "participant";

export const App = () => {
  const search = new URLSearchParams(window.location.search)
  const joinId = search.get('join_id')
  const [view, setView] = useState<View>(joinId ? "participant" : "host");
  const componentMap = {
    default: CreateSession,
    host: HostView,
    participant: ParticipantView,
  }
  
  return (
    <>
      <h1 className="title">Where’s the Lamb Sauce?</h1>
      {DEFAULT_POKER_VALUES}
      { view === 'participant' && <ParticipantView /> }
      { view === 'host' && <HostView /> }
    </>
  );
};
