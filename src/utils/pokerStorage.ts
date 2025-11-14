import {storage} from "./storage";

export function getUserSession(): string | null {
    return storage.get(USERNAME_KEY);
}

export function saveUserToSession(username: string): void {
    storage.set(USERNAME_KEY, username);
}

// session specific peerId
export function getPeerIdFromSession( sessionId: string): string | null {
    return storage.get(`pp_peerId_${sessionId}`);
}

export function savePeerIdToSession(sessionId: string, peerId: string): void {
    storage.set(`pp_peerId_${sessionId}`, peerId);
}





