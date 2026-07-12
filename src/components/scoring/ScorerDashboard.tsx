'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { closeMatch, resetMatch } from '@/app/actions/scoring'
import { useScoringEngine, TeamInfo } from '@/hooks/useScoringEngine'
import ScoringKeypad from './ScoringKeypad'
import ScoreboardHeader from './ScoreboardHeader'
import InningsSetupModal from './InningsSetupModal'
import WicketModal from './WicketModal'
import OverCompleteModal from './OverCompleteModal'
import OverTimeline from './OverTimeline'
import { syncDeliveries } from '@/app/actions/scoring'

export default function ScorerDashboard({ 
  matchId, 
  maxOvers,
  homeTeam, 
  awayTeam 
}: { 
  matchId: string, 
  maxOvers: number,
  homeTeam: TeamInfo, 
  awayTeam: TeamInfo 
}) {
  const engine = useScoringEngine(matchId, maxOvers, homeTeam, awayTeam)
  const router = useRouter()
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false)
  const [isOverCompleteModalOpen, setIsOverCompleteModalOpen] = useState(false)
  
  const [innings2Batter1, setInnings2Batter1] = useState('')
  const [innings2Batter2, setInnings2Batter2] = useState('')
  const [innings2Bowler, setInnings2Bowler] = useState('')

  // Determine current active team
  const battingTeam = engine.battingTeamId === homeTeam.id ? homeTeam : awayTeam
  const bowlingTeam = engine.bowlingTeamId === homeTeam.id ? homeTeam : awayTeam

  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online')

  // Background Sync Loop (15 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!navigator.onLine) {
        setSyncStatus('offline')
        return
      }

      if (engine.pendingSync.length > 0) {
        setSyncStatus('syncing')
        const deliveriesToSync = [...engine.pendingSync]
        
        try {
          await syncDeliveries(deliveriesToSync)
          // On success, filter out the ones we just successfully synced. 
          // This ensures that if the user scored MORE balls during the await, we don't drop them.
          const idsToRemove = new Set(deliveriesToSync.map(d => d.id))
          engine.setPendingSync(prev => prev.filter(d => !idsToRemove.has(d.id)))
          setSyncStatus('online')
        } catch (err) {
          console.error("Failed to sync deliveries in background loop", err)
          setSyncStatus('offline') // Treat as offline if the server call fails
        }
      } else {
        setSyncStatus('online')
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [engine.pendingSync, engine.setPendingSync])

  const handleRun = (runs: number) => {
    engine.handleDelivery(runs)
    checkOverComplete(runs, null)
  }

  const handleExtras = (type: string) => {
    engine.handleDelivery(0, type)
    checkOverComplete(0, type)
  }

  const handleWicketClick = () => {
    setIsWicketModalOpen(true)
  }

  const checkOverComplete = (runs: number, extras: string | null) => {
    // If it's the 6th legal ball, open the new bowler modal
    const isLegalBall = extras !== 'wide' && extras !== 'no_ball'
    if (isLegalBall && engine.stats.ballsInCurrentOver === 5) {
      setIsOverCompleteModalOpen(true)
    }
  }

  if (!engine.hasLoadedLocalState) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-gray-500">Loading match state...</div>
  }

  if (!engine.isSetupComplete) {
    return (
      <InningsSetupModal 
        homeTeam={homeTeam} 
        awayTeam={awayTeam} 
        onComplete={engine.initializeInnings} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      {/* If we are in Innings 2 or Match is Complete, show Innings 1 Scorecard in Print View */}
      {(engine.innings === 2 || (engine.innings === 1 && engine.stats.isInningsComplete)) && (
        <div className="print-only mb-12 page-break-after-always border-b-4 border-gray-800 pb-8">
          <h2 className="text-2xl font-black mb-4 uppercase tracking-widest border-b border-gray-200 pb-2 text-black">
            Innings 1 - {bowlingTeam.name} Batting
          </h2>
          <ScoreboardHeader 
            totalRuns={engine.innings1Stats.totalRuns}
            totalWickets={engine.innings1Stats.totalWickets}
            completedOvers={engine.innings1Stats.completedOvers}
            ballsInCurrentOver={engine.innings1Stats.ballsInCurrentOver}
            battingTeamName={bowlingTeam.name}
            bowlingTeamName={battingTeam.name}
            currentBatterId={engine.innings1Stats.inferredCurrentBatterId}
            nonStrikerId={engine.innings1Stats.inferredNonStrikerId}
            currentBowlerId={engine.innings1Stats.inferredCurrentBowlerId}
            batterStats={engine.innings1Stats.batterMap}
            bowlerStats={engine.innings1Stats.bowlerMap}
            extras={engine.innings1Stats.extrasBreakdown}
            battingSquad={bowlingTeam.squad}
            bowlingSquad={battingTeam.squad}
            syncStatus={syncStatus}
            pendingCount={0}
            maxOvers={maxOvers}
          />
        </div>
      )}

      <div className={engine.innings === 2 ? 'print-only-innings-2' : ''}>
        {engine.innings === 2 && (
          <h2 className="print-only text-2xl font-black mb-4 uppercase tracking-widest border-b border-gray-200 pb-2 text-black mt-8">
            Innings 2 - {battingTeam.name} Batting
          </h2>
        )}
        <ScoreboardHeader 
          totalRuns={engine.stats.totalRuns}
          totalWickets={engine.stats.totalWickets}
          completedOvers={engine.stats.completedOvers}
          ballsInCurrentOver={engine.stats.ballsInCurrentOver}
          battingTeamName={battingTeam.name}
          bowlingTeamName={bowlingTeam.name}
          currentBatterId={engine.currentBatterId}
          nonStrikerId={engine.nonStrikerId}
          currentBowlerId={engine.currentBowlerId}
          batterStats={engine.stats.batterMap}
          bowlerStats={engine.stats.bowlerMap}
          extras={engine.stats.extrasBreakdown}
          battingSquad={battingTeam.squad}
          bowlingSquad={bowlingTeam.squad}
          syncStatus={syncStatus}
          pendingCount={engine.pendingSync.length}
          maxOvers={maxOvers}
          targetScore={engine.innings === 2 ? engine.innings1Stats.totalRuns + 1 : undefined}
        />
      </div>

      <main className="flex-1 p-4 flex flex-col justify-end max-w-md mx-auto w-full no-print relative">
        <div className="absolute top-0 right-4">
          <button 
            onClick={async () => {
              const confirm1 = confirm("DANGER: Are you sure you want to COMPLETELY RESET this match?");
              if (!confirm1) return;
              const confirm2 = confirm("Are you REALLY SURE? This will permanently delete all deliveries and squads for this match.");
              if (!confirm2) return;
              
              const res = await resetMatch(matchId);
              if (res.error) {
                alert(res.error);
              } else {
                localStorage.removeItem(`match_state_${matchId}`);
                window.location.reload();
              }
            }}
            className="text-xs text-red-500 bg-red-900/10 hover:bg-red-900/30 px-3 py-1.5 rounded border border-red-900/30 transition opacity-50 hover:opacity-100"
          >
            Reset Match Data
          </button>
        </div>

        {engine.stats.isInningsComplete ? (
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-4 text-center mb-4 flex flex-col items-center">
            {engine.innings === 1 ? (
              <>
                <h2 className="text-xl font-bold text-green-400 mb-2">First Innings Complete!</h2>
                <p className="text-gray-300 mb-6">Target for {bowlingTeam.name}: <span className="font-bold text-white text-lg">{engine.innings1Stats.totalRuns + 1}</span></p>
                
                <div className="w-full text-left bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4 mb-4">
                  <h3 className="font-bold text-gray-300">Start 2nd Innings</h3>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Striker (Batter 1)</label>
                    <select className="w-full bg-gray-800 p-2 rounded text-white" value={innings2Batter1} onChange={e => setInnings2Batter1(e.target.value)}>
                       <option value="">Select Batter...</option>
                       {bowlingTeam.squad.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Non-Striker (Batter 2)</label>
                    <select className="w-full bg-gray-800 p-2 rounded text-white" value={innings2Batter2} onChange={e => setInnings2Batter2(e.target.value)}>
                       <option value="">Select Batter...</option>
                       {bowlingTeam.squad.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Opening Bowler</label>
                    <select className="w-full bg-gray-800 p-2 rounded text-white" value={innings2Bowler} onChange={e => setInnings2Bowler(e.target.value)}>
                       <option value="">Select Bowler...</option>
                       {battingTeam.squad.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (innings2Batter1 && innings2Batter2 && innings2Bowler && innings2Batter1 !== innings2Batter2) {
                      engine.startSecondInnings(innings2Batter1, innings2Batter2, innings2Bowler);
                    } else {
                      alert('Please select unique opening batters and a bowler.')
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  Start 2nd Innings
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-green-400 mb-2">Match Complete!</h2>
                <p className="text-gray-300 mb-6">
                  {(() => {
                    const diff = engine.innings1Stats.totalRuns - engine.innings2Stats.totalRuns;
                    if (engine.innings2Stats.totalRuns >= engine.innings1Stats.totalRuns + 1) {
                      return `${battingTeam.name} won by ${10 - engine.innings2Stats.totalWickets} wickets!`;
                    } else if (diff > 0) {
                      return `${bowlingTeam.name} won by ${diff} runs!`;
                    } else {
                      return "Match Tied!";
                    }
                  })()}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    onClick={() => {
                      const diff = engine.innings1Stats.totalRuns - engine.innings2Stats.totalRuns;
                      let res = '';
                      if (engine.innings2Stats.totalRuns >= engine.innings1Stats.totalRuns + 1) res = `${battingTeam.name} won by ${10 - engine.innings2Stats.totalWickets} wickets!`;
                      else if (diff > 0) res = `${bowlingTeam.name} won by ${diff} runs!`;
                      else res = "Match Tied!";
                      
                      const text = `🏆 Pitch Pulse Match Result\n\n${res}\n\nView full scorecard: ${window.location.origin}/live/${matchId}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex-1 bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Save PDF
                  </button>
                  <button 
                    onClick={async () => {
                      if(confirm('Are you sure you want to close this match? You cannot score it anymore.')) {
                        const diff = engine.innings1Stats.totalRuns - engine.innings2Stats.totalRuns;
                        let resultString = '';
                        if (engine.innings2Stats.totalRuns >= engine.innings1Stats.totalRuns + 1) {
                          resultString = `${battingTeam.name} won by ${10 - engine.innings2Stats.totalWickets} wickets`;
                        } else if (diff > 0) {
                          resultString = `${bowlingTeam.name} won by ${diff} runs`;
                        } else {
                          resultString = "Match Tied";
                        }
                        
                        // Compute star performers
                        let topBatterRuns = -1;
                        let topBatterId = '';
                        let topBowlerWickets = -1;
                        let topBowlerRuns = 999;
                        let topBowlerId = '';
                        
                        const allBatterStats = { ...engine.innings1Stats.batterMap, ...engine.innings2Stats.batterMap };
                        const allBowlerStats = { ...engine.innings1Stats.bowlerMap, ...engine.innings2Stats.bowlerMap };
                        
                        Object.entries(allBatterStats).forEach(([id, stats]) => {
                          if (stats.runs > topBatterRuns) {
                            topBatterRuns = stats.runs;
                            topBatterId = id;
                          }
                        });
                        
                        Object.entries(allBowlerStats).forEach(([id, stats]) => {
                          if (stats.wickets > topBowlerWickets || (stats.wickets === topBowlerWickets && stats.runs < topBowlerRuns)) {
                            topBowlerWickets = stats.wickets;
                            topBowlerRuns = stats.runs;
                            topBowlerId = id;
                          }
                        });
                        
                        const allPlayers = [...homeTeam.squad, ...awayTeam.squad];
                        const batterName = allPlayers.find(p => p.id === topBatterId)?.full_name || 'Unknown';
                        const bowlerName = allPlayers.find(p => p.id === topBowlerId)?.full_name || 'Unknown';
                        
                        const performersStr = topBatterRuns > 0 || topBowlerWickets > 0 
                          ? `🏏 ${batterName} (${topBatterRuns} runs) • 🔴 ${bowlerName} (${topBowlerWickets}/${topBowlerRuns})` 
                          : '';
                        
                        const res = await closeMatch(matchId, resultString, performersStr);
                        if (res.error) alert(res.error);
                        else router.push('/manager/dashboard');
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition"
                  >
                    Close Match
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <OverTimeline events={engine.stats.currentOverTimeline} />
            <ScoringKeypad 
              onRun={handleRun}
              onExtras={handleExtras}
              onWicket={handleWicketClick}
            />
            <div className="mt-4 flex gap-4 no-print">
              <button 
                onClick={() => {
                  if(confirm('Are you sure you want to declare this innings?')) {
                    engine.setIsDeclared(true)
                  }
                }}
                className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 font-bold py-3 rounded-xl text-sm transition active:scale-95 border border-yellow-500/30"
              >
                Declare Innings
              </button>
            </div>
          </>
        )}
      </main>

      {isWicketModalOpen && (
        <WicketModal 
          currentBatterId={engine.currentBatterId!}
          nonStrikerId={engine.nonStrikerId!}
          battingSquad={battingTeam.squad}
          onComplete={(wicketType, outBatterId, runs, incomingBatterId) => {
            engine.handleDelivery(runs, null, wicketType, outBatterId)
            engine.setNextBatter(incomingBatterId)
            setIsWicketModalOpen(false)
            checkOverComplete(runs, null)
          }}
          onCancel={() => setIsWicketModalOpen(false)}
        />
      )}

      {isOverCompleteModalOpen && (
        <OverCompleteModal 
          bowlingSquad={bowlingTeam.squad}
          currentBowlerId={engine.currentBowlerId!}
          onComplete={(newBowlerId) => {
            engine.setNextBowler(newBowlerId)
            setIsOverCompleteModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
