import { useState } from "react";
import { Card } from "./Card";

/**
 * Need to be able to enter name upon first joining
 * 
 * 
 */
export const ParticipantView = () => {

const [name, setName] = useState('')

  return (
    <>
    <h1>
      Enter your name: 
      </h1> 
      <input
        type="text"
        id="name"
        name="name"
        className="input-field"
        onChange={(e) => setName(e.target.value)}
        value={name}
        required />
        <input type="button" className="create-button" value="Join" onClick={() => alert("You joined!")} />
    </>
  )
}
