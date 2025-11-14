import { useState, useEffect } from "react";
import { AllCards, Card } from "./Card";
import { type DataConnection } from "peerjs";

export const ParticipantView = ({
  connection,
}: {
  connection: DataConnection;
}) => {
  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState(false);
  const [card, setCard] = useState("");
  const chooseCard = (value: string) => {
    setCard(value);
  };

  const [ready, setReady] = useState(false)
  useEffect(() => {
    connection.on('open', () => {
      setReady(true)
    })
  }, [connection])




  if (!ready) return 'Loading connection...'  
  
  return (
    <>
      {confirmedName ? (
        <>
          <h1>{`Welcome, ${name}`}</h1>
          {card ? <Card value={card} /> : <AllCards chooseCard={chooseCard} />}
          <button className="create-button" onClick={() => setCard("")}>
            Clear choice
          </button>
        </>
      ) : (
        <>
          <h1>Enter your name:</h1>
          <input
            type="text"
            id="name"
            name="name"
            className="input-field"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
          <input
            type="button"
            className="create-button"
            value="Join"
            onClick={() => {
              setConfirmedName(true)
              connection.send({
                name
              })?.then(() => console.log('successfully sent name'))
                .catch((err) => console.error('failed to send name:', err))
            }}
          />
        </>
      )}
    </>
  );
};
