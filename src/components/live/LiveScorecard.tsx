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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className={`text-center py-2 text-sm font-bold tracking-wider uppercase ${isCompleted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
        {isCompleted ? 'Completed Match 🏆' : 'Live Match 🔴'}
      </div>
      
      {isCompleted && result && (
        <div className="bg-gray-900 border-b border-gray-800 text-center py-4 px-6 text-green-400 font-bold text-lg">
          {result}
        </div>
      )}

      {hasInnings2 && (
        <div className="flex bg-gray-900 border-b border-gray-800">
          <button 
            className={`flex-1 py-3 text-sm font-bold transition-colors ${viewingInnings === 1 ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-800'}`}
            onClick={() => setViewingInnings(1)}
          >
            Innings 1
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold transition-colors ${viewingInnings === 2 ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-800'}`}
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
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-6 text-center mb-4">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Innings Complete!</h2>
            <p className="text-gray-300 text-lg">Total Score: {activeStats.totalRuns}</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
             <OverTimeline events={activeStats.currentOverTimeline} />
          </div>
        )}
      </main>
    </div>
  )
}
