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
  /** Options for voting */
  options?: string[]
  /** The current round number */
  round?: number
}
