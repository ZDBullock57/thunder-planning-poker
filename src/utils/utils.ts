import {storage} from "./storage";

const USERNAME_KEY = "pp_username";
export const DEFAULT_POKER_VALUES = ["1", "2", "3", "4", "5", "7", "8", "??"]

export function getUserSession(): string | null {
    return storage.getItem(USERNAME_KEY);
}

export function saveUserToSession(username: string): void {
    storage.setItem(USERNAME_KEY, username);
}

export function clearUserFromSession(): void {
    storage.removeItem(USERNAME_KEY);
}
// session specific peerId
export function getPeerIdFromSession( sessionId: string): string | null {
    return storage.getItem(`pp_peerId_${sessionId}`);
}

export function savePeerIdToSession(sessionId: string, peerId: string): void {
    storage.setItem(`pp_peerId_${sessionId}`, peerId);
}





