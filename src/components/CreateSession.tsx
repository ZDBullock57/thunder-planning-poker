// box in the middle with create session options
// name/title, voting options (post MVP)

import { useState } from "react";


export const CreateSession = () => {
    const [sessionName, setSessionName] = useState('')

  return (
    <>
    <div className="create-session">
      <h1>Enter a name for your session:</h1>
      <input 
        value={sessionName}
        className="input-field"
        onChange={(e) => setSessionName(e.target.value)}
        style={{width: 'fill'}}
      />
      <button 
        children='Create'
        className='create-button'
        disabled={!sessionName}
        onClick={() => alert(`You created session: ${sessionName}`)}
      />
    </div>
    </>
  );
};
