import { useState, useMemo, useEffect } from 'react'
import { computeScoreStats } from '@/utils/scoring'
import { createClient } from '@/utils/supabase/client'

export type DeliveryEvent = {
  id: string
  match_id: string
  innings_id: number
  over_number: number
  ball_number: number
  bowler_id: string
  batter_id: string
  non_striker_id: string
  runs_scored: number
  extras: string | null // 'wide', 'no_ball', 'bye', 'leg_bye', null
  wicket_type: string | null // 'bowled', 'caught', 'run_out', etc.
  out_batter_id: string | null
}

export type TeamInfo = {
  id: string
  name: string
  squad: { id: string; full_name: string; avatar_url?: string }[]
}

export type BatterStats = {
  id: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  out: boolean;
}

export type BowlerStats = {
  id: string;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
  econ: number;
}

export type TimelineEvent = {
  id: string;
  label: string;
  isWicket: boolean;
  isBoundary: boolean;
  isExtra: boolean;
}

export function useScoringEngine(matchId: string, maxOvers: number, homeTeam: TeamInfo, awayTeam: TeamInfo) {
  // Setup State
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [battingTeamId, setBattingTeamId] = useState<string | null>(null)
  const [bowlingTeamId, setBowlingTeamId] = useState<string | null>(null)

  // In-Game State
  const [innings, setInnings] = useState(1)
  const [currentBatterId, setCurrentBatterId] = useState<string | null>(null)
  const [nonStrikerId, setNonStrikerId] = useState<string | null>(null)
  const [currentBowlerId, setCurrentBowlerId] = useState<string | null>(null)
  
  const [deliveries, setDeliveries] = useState<DeliveryEvent[]>([])
  const [pendingSync, setPendingSync] = useState<DeliveryEvent[]>([])
  const [isDeclared, setIsDeclared] = useState(false)
  const [hasLoadedLocalState, setHasLoadedLocalState] = useState(false)
  
  const supabase = createClient()

  // 1. Load from Local Storage on Mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`match_state_${matchId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setIsSetupComplete(parsed.isSetupComplete ?? false)
        setBattingTeamId(parsed.battingTeamId ?? null)
        setBowlingTeamId(parsed.bowlingTeamId ?? null)
        setInnings(parsed.innings ?? 1)
        setCurrentBatterId(parsed.currentBatterId ?? null)
        setNonStrikerId(parsed.nonStrikerId ?? null)
        setCurrentBowlerId(parsed.currentBowlerId ?? null)
        setDeliveries(parsed.deliveries ?? [])
        setPendingSync(parsed.pendingSync ?? [])
        setIsDeclared(parsed.isDeclared ?? false)
      }
    } catch (e) {
      console.error('Failed to load match state from local storage', e)
    } finally {
      setHasLoadedLocalState(true)
    }
  }, [matchId])

  // 2. Save to Local Storage on Change
  useEffect(() => {
    if (!hasLoadedLocalState) return; // Don't overwrite with initial state before loading
    const stateToSave = {
      isSetupComplete,
      battingTeamId,
      bowlingTeamId,
      innings,
      currentBatterId,
      nonStrikerId,
      currentBowlerId,
      deliveries,
      pendingSync,
      isDeclared
    }
    localStorage.setItem(`match_state_${matchId}`, JSON.stringify(stateToSave))
  }, [
    hasLoadedLocalState,
    matchId, 
    isSetupComplete, 
    battingTeamId, 
    bowlingTeamId, 
    innings, 
    currentBatterId, 
    nonStrikerId, 
    currentBowlerId, 
    deliveries, 
    pendingSync,
    isDeclared
  ])

  // 3. Sync active players to Supabase for Fan View
  useEffect(() => {
    if (!hasLoadedLocalState || !matchId) return;

    const syncActivePlayers = async () => {
      await supabase
        .from('matches')
        .update({
          current_batter_id: currentBatterId,
          current_non_striker_id: nonStrikerId,
          current_bowler_id: currentBowlerId
        })
        .eq('id', matchId);
    };

    syncActivePlayers();
  }, [matchId, currentBatterId, nonStrikerId, currentBowlerId, hasLoadedLocalState, supabase]);

  const initializeInnings = (battingId: string, bowlingId: string, batter1: string, batter2: string, bowler: string) => {
    setBattingTeamId(battingId)
    setBowlingTeamId(bowlingId)
    setCurrentBatterId(batter1)
    setNonStrikerId(batter2)
    setCurrentBowlerId(bowler)
    setIsSetupComplete(true)
  }

  // DERIVED STATS
  const innings1Stats = useMemo(() => computeScoreStats(deliveries, maxOvers, 1, innings === 1 ? isDeclared : false), [deliveries, maxOvers, innings, isDeclared]);
  const innings2Stats = useMemo(() => computeScoreStats(deliveries, maxOvers, 2, innings === 2 ? isDeclared : false, innings1Stats.totalRuns + 1), [deliveries, maxOvers, innings, isDeclared, innings1Stats.totalRuns]);
  
  // Expose current stats based on the active innings
  const stats = innings === 1 ? innings1Stats : innings2Stats;

  const handleDelivery = (runs: number, extras: string | null = null, wicketType: string | null = null, outBatterId: string | null = null) => {
    if (!currentBatterId || !nonStrikerId || !currentBowlerId) return
    if (stats.isInningsComplete) return // Block if current innings is over

    const isLegalBall = extras !== 'wide' && extras !== 'no_ball'

    // Determine swap strike
    let swapStrike = runs % 2 !== 0;
    if (isLegalBall && stats.ballsInCurrentOver === 5) {
      swapStrike = !swapStrike; // Over completion swaps strike
    }

    const delivery: DeliveryEvent = {
      id: crypto.randomUUID(),
      match_id: matchId,
      innings_id: innings,
      over_number: stats.completedOvers,
      ball_number: isLegalBall ? stats.ballsInCurrentOver + 1 : stats.ballsInCurrentOver,
      bowler_id: currentBowlerId,
      batter_id: currentBatterId,
      non_striker_id: nonStrikerId,
      runs_scored: runs,
      extras,
      wicket_type: wicketType,
      out_batter_id: outBatterId
    }

    setDeliveries(prev => [...prev, delivery])
    setPendingSync(prev => [...prev, delivery])

    if (swapStrike && !wicketType) {
      setCurrentBatterId(nonStrikerId)
      setNonStrikerId(currentBatterId)
    }
  }

  const setNextBatter = (playerId: string) => {
    setCurrentBatterId(playerId)
  }

  const setNextBowler = (playerId: string) => {
    setCurrentBowlerId(playerId)
  }

  const startSecondInnings = (batter1: string, batter2: string, bowler: string) => {
    // Swap teams
    const newBattingId = bowlingTeamId;
    const newBowlingId = battingTeamId;
    
    setBattingTeamId(newBattingId);
    setBowlingTeamId(newBowlingId);
    setInnings(2);
    setCurrentBatterId(batter1);
    setNonStrikerId(batter2);
    setCurrentBowlerId(bowler);
    setIsDeclared(false);
  }

  return {
    isSetupComplete,
    initializeInnings,
    startSecondInnings,
    battingTeamId,
    bowlingTeamId,
    innings,
    currentBatterId,
    nonStrikerId,
    currentBowlerId,
    handleDelivery,
    setNextBatter,
    setNextBowler,
    deliveries,
    pendingSync,
    setPendingSync,
    isDeclared,
    setIsDeclared,
    stats,
    innings1Stats,
    innings2Stats,
    hasLoadedLocalState
  }
}
