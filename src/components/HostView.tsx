import { useEffect, useState } from "react"
import { Peer } from 'peerjs'
import { Card } from "./Card";


export const HostView = () => {
    const [sessionName, setSessionName] = useState('')

    const [peerId, setPeerId] = useState("")
    useEffect(() => {
        if (sessionName) {
            const peer = new Peer()
            peer.on('open', setPeerId)
        }
    }, [sessionName])    

    return <>
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
    <p>{peerId}</p>
    <button className="create-button" onClick={() => {
        const url = new URL(window.location.origin + '?join_id=' + peerId)
        navigator.clipboard.writeText(url.href)
            .then(() => alert("Link copied to clipboard!"))
            .catch((err) => {
                console.error("Failed to copy to clipboard", err)
                alert('Failed to copy to clipboard')
            })
    }}>Copy to clipboard</button>

    <Card /> 
    </>
}