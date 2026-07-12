'use client'

import { useState } from 'react'
import { useLiveScore } from '@/hooks/useLiveScore'
import { TeamInfo } from '@/hooks/useScoringEngine'
import ScoreboardHeader from '@/components/scoring/ScoreboardHeader'
import OverTimeline from '@/components/scoring/OverTimeline'

export default function LiveScorecard({
  matchId,
  status,
  result,
  maxOvers,
  homeTeam,
  awayTeam
}: {
  matchId: string
  status?: string
  result?: string
  maxOvers: number
  homeTeam: TeamInfo
  awayTeam: TeamInfo
}) {
  const { deliveries, innings1Stats, innings2Stats, isLoading } = useLiveScore(matchId, maxOvers)
  
  // By default, if innings 2 has started, show innings 2, otherwise show innings 1.
  // We use state to allow the user to toggle back and forth.
  const hasInnings2 = deliveries.some(d => d.innings_id === 2);
  const [viewingInnings, setViewingInnings] = useState<1 | 2>(hasInnings2 ? 2 : 1)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-gray-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Connecting to live match...</p>
        </div>
      </div>
    )
  }

  // Determine current active team. In a real app we'd get this from the match state directly, 
  // but for simplicity we assume home team bats first if deliveries exist, 
  // or we need a way to track the active innings.
  // For now, let's just pass both squads down and the ScoreboardHeader will look up by ID.
  const allSquads = [...homeTeam.squad, ...awayTeam.squad]

  // Determine active stats based on toggle
  const activeStats = viewingInnings === 1 ? innings1Stats : innings2Stats;
  
  // Figure out batting and bowling team for the active innings
  // Innings 1: we infer batting team by looking at the first delivery's batter in the squads.
  // Actually, we can just look at the first delivery of the active innings.
  const firstDelivery = deliveries.find(d => d.innings_id === viewingInnings);
  let battingTeamName = "Batting Team";
  let bowlingTeamName = "Bowling Team";
  
  if (firstDelivery) {
    const isHomeBatter = homeTeam.squad.some(p => p.id === firstDelivery.batter_id);
    if (isHomeBatter) {
      battingTeamName = homeTeam.name;
      bowlingTeamName = awayTeam.name;
    } else {
      battingTeamName = awayTeam.name;
      bowlingTeamName = homeTeam.name;
    }
  }

  const isCompleted = status === 'completed';

  return (
    <div className="min-h-screen text-white flex flex-col font-sans">
      {/* Broadcast Header Bar */}
      <div className={`text-center py-3 px-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 shadow-lg shadow-black/50 border-b border-gray-800/50 ${isCompleted ? 'bg-gradient-to-r from-green-800 to-green-600' : 'bg-gradient-to-r from-gray-900 to-gray-800'}`}>
        {!isCompleted && <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
        {isCompleted ? 'Completed Match 🏆' : 'Live Broadcast'}
        {!isCompleted && <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
      </div>
      
      {isCompleted && result && (
        <div className="bg-gray-950/80 backdrop-blur-md border-b border-gray-800 text-center py-4 px-6 text-green-400 font-black text-xl shadow-inner">
          {result}
        </div>
      )}

      {hasInnings2 && (
        <div className="flex bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
          <button 
            className={`flex-1 py-3 text-sm font-black tracking-widest uppercase transition-all ${viewingInnings === 1 ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500 shadow-inner' : 'text-gray-500 hover:bg-gray-800/50'}`}
            onClick={() => setViewingInnings(1)}
          >
            Innings 1
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-black tracking-widest uppercase transition-all ${viewingInnings === 2 ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500 shadow-inner' : 'text-gray-500 hover:bg-gray-800/50'}`}
            onClick={() => setViewingInnings(2)}
          >
            Innings 2
          </button>
        </div>
      )}

      <ScoreboardHeader 
        totalRuns={activeStats.totalRuns}
        totalWickets={activeStats.totalWickets}
        completedOvers={activeStats.completedOvers}
        ballsInCurrentOver={activeStats.ballsInCurrentOver}
        battingTeamName={battingTeamName}
        bowlingTeamName={bowlingTeamName}
        currentBatterId={activeStats.inferredCurrentBatterId}
        nonStrikerId={activeStats.inferredNonStrikerId}
        currentBowlerId={activeStats.inferredCurrentBowlerId}
        batterStats={activeStats.batterMap}
        bowlerStats={activeStats.bowlerMap}
        extras={activeStats.extrasBreakdown}
        battingSquad={allSquads}
        bowlingSquad={allSquads}
        syncStatus={isCompleted ? "offline" : "online"} 
        pendingCount={0}
        maxOvers={maxOvers}
        targetScore={viewingInnings === 2 ? innings1Stats.totalRuns + 1 : undefined}
      />

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full mt-4">
        {activeStats.isInningsComplete ? (
          <div className="bg-green-900/40 backdrop-blur-md border border-green-500/50 rounded-2xl p-8 text-center mb-4 shadow-xl shadow-green-900/20">
            <h2 className="text-3xl font-black text-green-400 mb-2 tracking-tight">Innings Complete!</h2>
            <p className="text-gray-300 text-xl font-medium">Total Score: <span className="font-black text-white">{activeStats.totalRuns} / {activeStats.totalWickets}</span></p>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-gray-950/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 shadow-2xl">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 text-center">Current Over Event Timeline</h3>
             <OverTimeline events={activeStats.currentOverTimeline} />
          </div>
        )}
      </main>
    </div>
  )
}
