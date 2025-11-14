import { useState, useEffect } from "react"
import { Peer } from 'peerjs'
import { RevealButton } from "./RevealButton";
import { UserCard } from "./UserCard";

const FAKE_USERS = ["Seif", "Duncan", "Zach"]

export const HostView = ({ peer }: { peer: Peer }) => {
    const [sessionName, setSessionName] = useState('')
    const [sessionStarted, setSessionStarted] = useState(false)
    const [userPoint, setUserPoints] = useState<Record<string, null | string>>({})

    useEffect(() => {
        peer.on('connection', () => console.log("peer connected!"))
        peer.on('data', (data) => {
            console.log("Data:", data)
            if (data?.name) {
                setUserPoints(current => ({...current, [data.name]: null}))
            }
        })
    }, [peer])
    

    return !sessionStarted ? (<>
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
                onClick={() => setSessionStarted(true)}
            />
        </div>
        
    </>) : (<>
        <p>{peer.id}</p>
        <button className="create-button" onClick={() => {
            const url = new URL(window.location.origin + '?join_id=' + peer.id)
            navigator.clipboard.writeText(url.href)
                .then(() => alert("Link copied to clipboard!"))
                .catch((err) => {
                    console.error("Failed to copy to clipboard", err)
                    alert('Failed to copy to clipboard')
                })
        }}>Copy to clipboard</button>
        
        <RevealButton />
        

        {/* List users */}
        {FAKE_USERS.map( user => {
            return (
                <UserCard userName={user} />
            )
        })}
        
        <button className="create-button" onClick={() => alert("start new round!")}>Start new pointing round - we found the lamb sauce</button> 
    </>)
}