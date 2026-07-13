import { BatterStats, BowlerStats } from '@/hooks/useScoringEngine'

export default function ScoreboardHeader({
  totalRuns,
  totalWickets,
  completedOvers,
  ballsInCurrentOver,
  battingTeamName,
  bowlingTeamName,
  currentBatterId,
  nonStrikerId,
  currentBowlerId,
  batterStats,
  bowlerStats,
  extras,
  battingSquad,
  bowlingSquad,
  syncStatus,
  pendingCount,
  targetScore,
  maxOvers
}: {
  totalRuns: number
  totalWickets: number
  completedOvers: number
  ballsInCurrentOver: number
  battingTeamName: string
  bowlingTeamName: string
  currentBatterId: string | null
  nonStrikerId: string | null
  currentBowlerId: string | null
  batterStats: Record<string, BatterStats>
  bowlerStats: Record<string, BowlerStats>
  extras: { w: number, nb: number, b: number, lb: number, total: number }
  battingSquad: { id: string; full_name: string; avatar_url?: string }[]
  bowlingSquad: { id: string; full_name: string; avatar_url?: string }[]
  syncStatus: 'online' | 'syncing' | 'offline'
  pendingCount: number
  targetScore?: number
  maxOvers: number
}) {

  const getBatter = (id: string | null) => battingSquad.find(p => p.id === id) || { full_name: '...', avatar_url: undefined }
  const getBowler = (id: string | null) => bowlingSquad.find(p => p.id === id) || { full_name: '...', avatar_url: undefined }

  const strikerStats = currentBatterId && batterStats[currentBatterId] ? batterStats[currentBatterId] : { runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0 }
  const nonStrikerStats = nonStrikerId && batterStats[nonStrikerId] ? batterStats[nonStrikerId] : { runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0 }
  const bowler = currentBowlerId && bowlerStats[currentBowlerId] ? bowlerStats[currentBowlerId] : { overs: 0, runs: 0, wickets: 0, econ: 0 }

  const currentRunRate = (completedOvers > 0 || ballsInCurrentOver > 0) 
    ? (totalRuns / (completedOvers + ballsInCurrentOver / 6)).toFixed(2) 
    : '0.00'

  let rrr = '0.00'
  let runsNeeded = 0
  let ballsRemaining = 0
  if (targetScore) {
    runsNeeded = Math.max(0, targetScore - totalRuns)
    ballsRemaining = Math.max(0, (maxOvers * 6) - (completedOvers * 6 + ballsInCurrentOver))
    if (ballsRemaining > 0) {
      rrr = (runsNeeded / (ballsRemaining / 6)).toFixed(2)
    }
  }

  return (
    <div className="bg-gray-950/70 backdrop-blur-3xl border-b border-gray-800/50 p-4 lg:p-6 sticky top-0 z-10 shadow-2xl shadow-black/50">
      <div className="max-w-4xl mx-auto space-y-4">
        
        <div className="print-only mb-8 text-center border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-widest">Pitch Pulse</h1>
          <h2 className="text-xl font-bold mt-2">Official Match Scorecard</h2>
        </div>

        {/* Top Status Bar */}
        <div className="flex justify-end mb-2">
          {syncStatus === 'offline' ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Offline - {pendingCount} unsynced
            </div>
          ) : syncStatus === 'syncing' ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Syncing {pendingCount}...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-500/50">
              <span className="h-2 w-2 rounded-full bg-green-500/50"></span>
              Live
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-gray-400 font-black tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              {battingTeamName}
            </div>
            <div className="flex items-baseline gap-4">
              <h2 className="text-7xl md:text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                {totalRuns}<span className="text-4xl md:text-5xl text-gray-500 font-black">/{totalWickets}</span>
              </h2>
              <div className="text-2xl md:text-3xl text-gray-400 font-bold tabular-nums bg-gray-900/50 px-3 py-1 rounded-xl border border-gray-800">
                {completedOvers}.{ballsInCurrentOver} <span className="text-sm font-bold text-gray-500">OVERS</span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                <span className="text-gray-500 mr-2">CRR</span>
                <span className="text-white">{currentRunRate}</span>
              </div>
              
              {targetScore && (
                <>
                  <div className="bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-800/50">
                    <span className="text-blue-400 mr-2">RRR</span>
                    <span className="text-white">{rrr}</span>
                  </div>
                  <div className="bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-800/50">
                    <span className="text-green-400 mr-2">Target</span>
                    <span className="text-white">{targetScore}</span>
                  </div>
                </>
              )}
            </div>

            {targetScore && runsNeeded > 0 && ballsRemaining > 0 && (
              <div className="mt-4 text-lg font-black tracking-tight text-yellow-500 bg-yellow-900/20 px-4 py-2 rounded-xl inline-block border border-yellow-700/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                Need {runsNeeded} runs from {ballsRemaining} balls
              </div>
            )}
            {targetScore && runsNeeded <= 0 && (
              <div className="mt-4 text-lg font-black tracking-tight text-pitch-green bg-green-900/20 px-4 py-2 rounded-xl inline-block border border-green-700/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                Target Reached!
              </div>
            )}
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-md p-4 rounded-2xl border border-gray-800 shadow-inner self-start md:self-end min-w-[200px]">
            <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Extras</span>
              <span className="text-white bg-gray-800 px-2 py-0.5 rounded text-sm">{extras.total}</span>
            </div>
            <div className="flex gap-3 text-sm font-semibold text-gray-300">
              <div><span className="text-gray-500">W</span> {extras.w}</div>
              <div><span className="text-gray-500">NB</span> {extras.nb}</div>
              <div><span className="text-gray-500">B</span> {extras.b}</div>
              <div><span className="text-gray-500">LB</span> {extras.lb}</div>
            </div>
          </div>
        </div>

        {/* Middle Row: Batting Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full text-left text-sm lg:text-base">
            <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 font-medium flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M9.5 2.5L10.5 7.5L8 21.5H12L15 7.5L14.5 2.5H9.5Z" fill="currentColor" fillOpacity="0.2"/>
                    <path d="M11.5 2V8M13.5 8H8.5" />
                  </svg>
                  Batter
                </th>
                <th className="px-4 py-2 font-medium text-right w-12">R</th>
                <th className="px-4 py-2 font-medium text-right w-12">B</th>
                <th className="px-4 py-2 font-medium text-right w-12 hidden sm:table-cell">4s</th>
                <th className="px-4 py-2 font-medium text-right w-12 hidden sm:table-cell">6s</th>
                <th className="px-4 py-2 font-medium text-right w-16">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              <tr className="bg-blue-900/10">
                <td className="px-4 py-3 font-semibold text-white flex items-center gap-3">
                  {getBatter(currentBatterId).avatar_url ? (
                    <img src={getBatter(currentBatterId).avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
                      {getBatter(currentBatterId).full_name.substring(0,2).toUpperCase()}
                    </div>
                  )}
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                    {getBatter(currentBatterId).full_name}*
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-right">{strikerStats.runs}</td>
                <td className="px-4 py-3 text-gray-300 text-right">{strikerStats.balls}</td>
                <td className="px-4 py-3 text-gray-400 text-right hidden sm:table-cell">{strikerStats.fours}</td>
                <td className="px-4 py-3 text-gray-400 text-right hidden sm:table-cell">{strikerStats.sixes}</td>
                <td className="px-4 py-3 text-gray-400 text-right">{strikerStats.sr}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-300 pl-8 flex items-center gap-3">
                  {getBatter(nonStrikerId).avatar_url ? (
                    <img src={getBatter(nonStrikerId).avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-700 opacity-80" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                      {getBatter(nonStrikerId).full_name.substring(0,2).toUpperCase()}
                    </div>
                  )}
                  <span>{getBatter(nonStrikerId).full_name}</span>
                </td>
                <td className="px-4 py-3 font-bold text-right">{nonStrikerStats.runs}</td>
                <td className="px-4 py-3 text-gray-300 text-right">{nonStrikerStats.balls}</td>
                <td className="px-4 py-3 text-gray-400 text-right hidden sm:table-cell">{nonStrikerStats.fours}</td>
                <td className="px-4 py-3 text-gray-400 text-right hidden sm:table-cell">{nonStrikerStats.sixes}</td>
                <td className="px-4 py-3 text-gray-400 text-right">{nonStrikerStats.sr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Row: Bowler and Extras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <table className="w-full text-left text-sm lg:text-base">
              <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2"/>
                      <path d="M8 5.5C10 9 10 15 8 18.5" strokeDasharray="2 2" />
                      <path d="M16 5.5C14 9 14 15 16 18.5" strokeDasharray="2 2" />
                    </svg>
                    Bowler
                  </th>
                  <th className="px-4 py-2 font-medium text-right w-12">O</th>
                  <th className="px-4 py-2 font-medium text-right w-12">R</th>
                  <th className="px-4 py-2 font-medium text-right w-12">
                    <div className="flex items-center justify-end gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 hidden sm:block">
                        <path d="M6 5v16M12 5v16M18 5v16" />
                        <path d="M4 5h16" />
                      </svg>
                      W
                    </div>
                  </th>
                  <th className="px-4 py-2 font-medium text-right w-16 hidden sm:table-cell">ECO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-semibold text-white flex items-center gap-3">
                    {getBowler(currentBowlerId).avatar_url ? (
                      <img src={getBowler(currentBowlerId).avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-red-900/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                        {getBowler(currentBowlerId).full_name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <span>{getBowler(currentBowlerId).full_name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-right">{bowler.overs}</td>
                  <td className="px-4 py-3 text-gray-300 text-right">{bowler.runs}</td>
                  <td className="px-4 py-3 font-bold text-red-400 text-right">{bowler.wickets}</td>
                  <td className="px-4 py-3 text-gray-400 text-right hidden sm:table-cell">{bowler.econ}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-800 rounded-xl p-3 lg:p-4 border border-gray-700 flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Extras</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{extras.total}</span>
              <span className="text-xs text-gray-500">
                (W {extras.w}, NB {extras.nb}, B {extras.b}, LB {extras.lb})
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
