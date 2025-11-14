

export function useUsername(sessionId: string): string | null {
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        pokerStorage.setUsername(sessionId, 'Guest');
    }, [sessionId]);

    return [username, setUsername];

}