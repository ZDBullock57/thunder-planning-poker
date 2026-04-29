import { useMemo } from 'react'
import { SparklesIcon } from './Icons'

interface VoteStatsProps {
    votes: (string | null)[]
    options: string[]
}

// Color palette for pie slices - elegant, coordinated colors
const SLICE_COLORS = [
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
]

interface PieChartProps {
    data: [string, number][]
    total: number
}

const PieChart = ({ data, total }: PieChartProps) => {
    const size = 120
    const center = size / 2
    const radius = 45
    const innerRadius = 25 // For donut effect

    const slices = useMemo(() => {
        let currentAngle = -90 // Start from top

        return data.map(([label, count], index) => {
            const percentage = count / total
            const angle = percentage * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle = endAngle

            // Convert angles to radians
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180

            // Calculate arc points for outer edge
            const x1 = center + radius * Math.cos(startRad)
            const y1 = center + radius * Math.sin(startRad)
            const x2 = center + radius * Math.cos(endRad)
            const y2 = center + radius * Math.sin(endRad)

            // Calculate arc points for inner edge (donut)
            const ix1 = center + innerRadius * Math.cos(startRad)
            const iy1 = center + innerRadius * Math.sin(startRad)
            const ix2 = center + innerRadius * Math.cos(endRad)
            const iy2 = center + innerRadius * Math.sin(endRad)

            const largeArc = angle > 180 ? 1 : 0

            // Path for donut slice
            const path = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${ix2} ${iy2}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
                'Z'
            ].join(' ')

            return {
                path,
                color: SLICE_COLORS[index % SLICE_COLORS.length],
                label,
                count,
                percentage,
            }
        })
    }, [data, total])

    return (
        <div className="flex items-center gap-4">
            <svg width={size} height={size} className="flex-shrink-0">
                {slices.map((slice, i) => (
                    <path
                        key={i}
                        d={slice.path}
                        fill={slice.color}
                        className="transition-all duration-300 hover:opacity-80"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    />
                ))}
                {/* Center circle for cleaner donut look */}
                <circle cx={center} cy={center} r={innerRadius - 2} fill="#1e293b" />
            </svg>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 min-w-0">
                {slices.map((slice, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: slice.color }}
                        />
                        <span className="text-lg font-bold text-slate-100">{slice.label}</span>
                        <span className="text-xs text-slate-400">
                            {slice.count} ({Math.round(slice.percentage * 100)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Find the recommended value from options based on average (nearest match)
const findRecommendedValue = (average: number | null, options: string[], mostCommonVote: string): string => {
    // If no average (non-numeric votes), return the most common vote
    if (average === null) {
        return mostCommonVote
    }

    // Get numeric options sorted in ascending order
    const numericOptions = options
        .map(opt => ({ original: opt, num: Number(opt) }))
        .filter(opt => !isNaN(opt.num))
        .sort((a, b) => a.num - b.num)

    if (numericOptions.length === 0) {
        return mostCommonVote
    }

    // Find the option closest to the average
    let recommended = numericOptions[0]
    let smallestDiff = Math.abs(numericOptions[0].num - average)
    
    for (const opt of numericOptions) {
        const diff = Math.abs(opt.num - average)
        if (diff < smallestDiff) {
            smallestDiff = diff
            recommended = opt
        }
    }

    return recommended.original
}

export const VoteStats = ({ votes, options }: VoteStatsProps) => {
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

        // Get recommended value
        const recommended = findRecommendedValue(average, options, sorted[0][0])

        return { sorted, average, isConsensus, total: validVotes.length, recommended }
    }, [votes, options])

    if (!stats) {
        return null
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-4 w-full max-w-lg border border-slate-700">
            <h3 className="text-base font-bold text-slate-100 mb-3">Vote Summary</h3>

            {stats.isConsensus && (
                <div className="mb-3 p-2 bg-emerald-900/50 border border-emerald-600 rounded-lg text-emerald-300 font-semibold text-center text-sm flex items-center justify-center gap-1.5">
                    <SparklesIcon size={14} /> Consensus: {stats.sorted[0][0]}
                </div>
            )}

            <div className="flex items-center gap-4">
                {/* Recommended Value Panel */}
                <div className="flex flex-col items-center justify-center bg-emerald-900/30 border border-emerald-600/50 rounded-xl p-3 min-w-[80px]">
                    <span className="text-xs text-emerald-400 font-medium uppercase tracking-wide mb-1">Estimate</span>
                    <span className="text-4xl font-bold text-emerald-400">{stats.recommended}</span>
                </div>

                {/* Pie Chart */}
                <PieChart data={stats.sorted} total={stats.total} />
            </div>
        </div>
    )
}
