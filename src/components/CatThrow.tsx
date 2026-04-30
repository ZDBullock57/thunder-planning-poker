import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CatIcon } from './Icons'

export interface CatThrowEvent {
  id: string
  targetName: string
  fromName: string
  timestamp: number
}

interface FlyingCatProps {
  event: CatThrowEvent
  targetRef: React.RefObject<HTMLElement | null>
  onComplete: () => void
}

const CAT_COLORS = [
  'text-orange-400', // ginger cat
  'text-slate-400', // gray cat
  'text-amber-600', // tabby
  'text-pink-400', // pink cat
  'text-purple-400', // purple cat
  'text-cyan-400', // cyan cat
  'text-lime-400', // lime cat
  'text-rose-400', // rose cat
]

const FlyingCat = ({ targetRef, onComplete }: FlyingCatProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [visible, setVisible] = useState(true)

  // Random color for this cat (picked once on mount)
  const [catColor] = useState(
    () => CAT_COLORS[Math.floor(Math.random() * CAT_COLORS.length)]
  )

  // Use ref for onComplete to avoid re-running animation when it changes
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Track if animation already started to prevent restarts
  const animationStarted = useRef(false)

  useEffect(() => {
    // Only run animation once
    if (animationStarted.current) return
    animationStarted.current = true

    const targetRect = targetRef.current?.getBoundingClientRect()
    if (!targetRect) {
      onCompleteRef.current()
      return
    }

    // Random starting edge
    const edge = Math.floor(Math.random() * 4)
    const w = window.innerWidth
    const h = window.innerHeight
    let startX: number, startY: number
    switch (edge) {
      case 0:
        startX = Math.random() * w
        startY = -60
        break
      case 1:
        startX = Math.random() * w
        startY = h + 60
        break
      case 2:
        startX = -60
        startY = Math.random() * h
        break
      default:
        startX = w + 60
        startY = Math.random() * h
        break
    }

    // Calculate where the cat hits the EDGE of the card (not the center)
    const centerX = targetRect.left + targetRect.width / 2
    const centerY = targetRect.top + targetRect.height / 2

    // Direction from start to center
    const dx = centerX - startX
    const dy = centerY - startY

    // Find intersection with card edge
    // Check all 4 edges and find closest intersection
    let targetX = centerX
    let targetY = centerY
    let minT = Infinity

    // Helper: line from (startX, startY) in direction (dx, dy)
    // Parametric: P = start + t * direction, we want t where P hits edge

    // Left edge (x = targetRect.left)
    if (dx !== 0) {
      const t = (targetRect.left - startX) / dx
      const y = startY + t * dy
      if (t > 0 && t < minT && y >= targetRect.top && y <= targetRect.bottom) {
        minT = t
        targetX = targetRect.left
        targetY = y
      }
    }

    // Right edge (x = targetRect.right)
    if (dx !== 0) {
      const t = (targetRect.right - startX) / dx
      const y = startY + t * dy
      if (t > 0 && t < minT && y >= targetRect.top && y <= targetRect.bottom) {
        minT = t
        targetX = targetRect.right
        targetY = y
      }
    }

    // Top edge (y = targetRect.top)
    if (dy !== 0) {
      const t = (targetRect.top - startY) / dy
      const x = startX + t * dx
      if (t > 0 && t < minT && x >= targetRect.left && x <= targetRect.right) {
        minT = t
        targetX = x
        targetY = targetRect.top
      }
    }

    // Bottom edge (y = targetRect.bottom)
    if (dy !== 0) {
      const t = (targetRect.bottom - startY) / dy
      const x = startX + t * dx
      if (t > 0 && t < minT && x >= targetRect.left && x <= targetRect.right) {
        minT = t
        targetX = x
        targetY = targetRect.bottom
      }
    }

    // Offset for cat icon size
    targetX -= 20
    targetY -= 20

    // Animation state
    let phase: 'fly' | 'fall' = 'fly'
    let phaseStart = Date.now()
    let impactX = 0,
      impactY = 0
    let velocityX = 0,
      velocityY = 0

    const animate = () => {
      const now = Date.now()
      const elapsed = now - phaseStart
      const t = elapsed / 1000

      if (phase === 'fly') {
        // Fly towards target over 400ms
        const progress = Math.min(elapsed / 400, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        const x = startX + (targetX - startX) * eased
        const y = startY + (targetY - startY) * eased

        setPosition({ x, y })
        setRotation(progress * 720)

        if (progress >= 1) {
          // Hit the target - immediately start falling
          phase = 'fall'
          phaseStart = now
          impactX = targetX
          impactY = targetY
          // Calculate bounce direction (opposite of incoming)
          const dx = targetX - startX
          const dy = targetY - startY
          const dist = Math.sqrt(dx * dx + dy * dy)
          velocityX = -(dx / dist) * 150 // bounce back
          velocityY = -200 // pop UP
          setScale(1.3)
        }
      } else if (phase === 'fall') {
        // Physics: position = initial + velocity*t + 0.5*gravity*t^2
        const gravity = 600
        const x = impactX + velocityX * t
        const y = impactY + velocityY * t + 0.5 * gravity * t * t

        setPosition({ x, y })
        setRotation(720 + t * 300)
        setScale(Math.max(0.5, 1.3 - t * 0.4))

        // Done when off screen
        if (y > h + 100) {
          setVisible(false)
          onCompleteRef.current()
          return
        }
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [targetRef])

  if (!visible) return null

  return createPortal(
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      <CatIcon size={40} className={`${catColor} drop-shadow-lg`} />
    </div>,
    document.body
  )
}

interface CatThrowManagerProps {
  events: CatThrowEvent[]
  getTargetRef: (name: string) => React.RefObject<HTMLElement | null> | null
  onEventComplete: (id: string) => void
}

export const CatThrowManager = ({
  events,
  getTargetRef,
  onEventComplete,
}: CatThrowManagerProps) => {
  return (
    <>
      {events.map((event) => {
        const targetRef = getTargetRef(event.targetName)
        if (!targetRef) return null

        return (
          <FlyingCat
            key={event.id}
            event={event}
            targetRef={targetRef}
            onComplete={() => onEventComplete(event.id)}
          />
        )
      })}
    </>
  )
}
