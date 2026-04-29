import { useMemo } from 'react'

interface VoteStatsProps {
    votes: (string | null)[]
}

export const VoteStats = ({ votes }: VoteStatsProps) => {
    const stats = useMemo(() => {
        const validVotes = votes.filter((v): v is string => v !== null && v !== '')

        if (validVotes.length === 0) {
            return null
        }

        // Count occurrences
        const counts: Record<string, number> = {}
        validVotes.forEach((vote) => {
            counts[vote] = (counts[vote] || 0) + 1
        })

        // Sort by count (descending)
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

        // Calculate average if all votes are numeric
        const numericVotes = validVotes.map(Number).filter((n) => !isNaN(n))
        const average =
            numericVotes.length === validVotes.length && numericVotes.length > 0
                ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
                : null

        // Check for consensus (all same vote)
        const isConsensus = new Set(validVotes).size === 1

        return { sorted, average, isConsensus, total: validVotes.length }
    }, [votes])

    if (!stats) {
        return null
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Vote Summary</h3>

            {stats.isConsensus && (
                <div className="mb-4 p-3 bg-green-100 rounded-lg text-green-800 font-semibold text-center">
                    🎉 Consensus reached: {stats.sorted[0][0]}
                </div>
            )}

            <div className="space-y-2">
                {stats.sorted.map(([vote, count]) => (
                    <div key={vote} className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-700">{vote}</span>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 bg-blue-500 rounded"
                                style={{ width: `${(count / stats.total) * 100}px` }}
                            />
                            <span className="text-sm text-gray-600">
                                {count} vote{count > 1 ? 's' : ''} ({Math.round((count / stats.total) * 100)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {stats.average !== null && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-gray-600">Average: </span>
                    <span className="text-xl font-bold text-blue-600">
                        {stats.average.toFixed(1)}
                    </span>
                </div>
            )}
        </div>
    )
}
