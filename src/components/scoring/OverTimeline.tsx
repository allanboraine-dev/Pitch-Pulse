import { TimelineEvent } from '@/hooks/useScoringEngine'

export default function OverTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="mb-4 bg-gray-900 rounded-xl p-3 border border-gray-800 flex items-center shadow-inner">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-3 shrink-0">
        This Over
      </span>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 flex-1">
        {events.length === 0 ? (
          <span className="text-gray-600 text-sm italic">No balls bowled yet</span>
        ) : (
          events.map(event => (
            <div 
              key={event.id}
              className={`
                h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-md border
                ${event.isWicket 
                  ? 'bg-red-600 border-red-500 text-white' 
                  : event.isBoundary 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : event.isExtra
                      ? 'bg-yellow-600/30 border-yellow-500/50 text-yellow-500'
                      : event.label === '•'
                        ? 'bg-gray-800 border-gray-700 text-gray-400'
                        : 'bg-gray-700 border-gray-600 text-white'
                }
              `}
            >
              {event.label}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
