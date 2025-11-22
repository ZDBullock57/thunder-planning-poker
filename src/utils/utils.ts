import { storage } from './storage'

const USERNAME_KEY = 'pp_username'
export const DEFAULT_POKER_VALUES = ['1', '2', '3', '4', '5', '7', '8', '??']

export function getUserSession(): string | null {
  return storage.get<string | null>(USERNAME_KEY, null)
}

export function saveUserToSession(username: string): void {
  storage.set(USERNAME_KEY, username)
}

export function clearUserFromSession(): void {
  storage.remove(USERNAME_KEY)
}
// session specific peerId
export function getPeerIdFromSession(sessionId: string): string | null {
  return storage.get<string | null>(`pp_peerId_${sessionId}`, null)
}

export function savePeerIdToSession(sessionId: string, peerId: string): void {
  storage.set(`pp_peerId_${sessionId}`, peerId)
}
