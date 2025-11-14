import {storage} from "./storage";

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





