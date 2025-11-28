import React, { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
    durationSeconds: number;
    startTimestamp: number | null; 
    onTimerEnd?: () => void;

}

export const CountdownTimer = ({durationSeconds, startTimestamp, onTimerEnd}: CountdownTimerProps) => {
    const animationFrameRef = React.useRef<number | null>(null);
    const startTime = useRef<number | null>(0)
    const totalDurationMs = durationSeconds * 1000

    const [timeRemaining, setTimeRemaining] = useState(durationSeconds)

    const stopTimer = () => {
        if(animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }
    }

    useEffect(() => {
        
        if(startTimestamp===null){      
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTimeRemaining(durationSeconds)
            stopTimer()
            
        }

        startTime.current = startTimestamp

        const tick = () => {
    
            const now = Date.now()
            const elapsed = now - startTime.current
            const remaining = Math.max(0, totalDurationMs - elapsed)
      
            const remainingSeconds = Math.ceil(remaining / 1000)
            setTimeRemaining(remainingSeconds)
      
            if (remaining > 0) {
              animationFrameRef.current = requestAnimationFrame(tick)
            } else {
              stopTimer()
              onTimerEnd?.()
            }
          }

          animationFrameRef.current = requestAnimationFrame(tick)

          return stopTimer
    }, [durationSeconds, onTimerEnd, startTimestamp, totalDurationMs])

    // Format seconds into MM:SS
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`

    const timerClass = timeRemaining <= 10 && timeRemaining>0 ? 'text-red-500 font-extrabold animate-pulse' : timeRemaining<=30 && timeRemaining> 0 ? 'text-yellow-600 font-bold' : 'text-green-700 font-semibold'

    return (
        <div
          className={`text-2xl tracking-wider py-2 transition-colors duration-300 ${timerClass}`}
        >
          {formattedTime}
        </div>
      )

}