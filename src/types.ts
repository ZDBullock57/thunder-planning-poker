export type UserData = {
  name?: string
  vote?: string | null
}

export type HostData = {
  sessionName?: string
  /** Any arbitrary details about what is being voted on */
  details?: string
  /** What to display in the user cards */
  cards?: (string | null)[]
  /** What to display in the user names */
  userNames?: (string | null)[]
  /** Options for voting */
  options?: string[]
  /** The current round number */
  round?: number
  /** The total time allocated for voting in seconds */
  timeLimitSeconds?: number
  /** Timestamp (in milliseconds) when the current round's timer started */
  countdownStartTimestamp?: number | null
  /** Whether the countdown timer is currently paused */
  countdownPaused?: boolean
}
