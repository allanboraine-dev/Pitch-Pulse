import { DeliveryEvent, BatterStats, BowlerStats, TimelineEvent } from '@/hooks/useScoringEngine'

export type InningsStats = {
  totalRuns: number
  totalWickets: number
  completedOvers: number
  ballsInCurrentOver: number
  extrasBreakdown: { w: number; nb: number; b: number; lb: number; total: number }
  batterMap: Record<string, BatterStats>
  bowlerMap: Record<string, BowlerStats>
  currentOverTimeline: TimelineEvent[]
  isInningsComplete: boolean
  isDeclared: boolean
  inferredCurrentBatterId: string | null
  inferredNonStrikerId: string | null
  inferredCurrentBowlerId: string | null
}

export function computeScoreStats(
  deliveries: DeliveryEvent[], 
  maxOvers: number, 
  inningsId: number, 
  isDeclared: boolean = false, 
  targetScore: number | null = null
): InningsStats {
  const inningsDeliveries = deliveries.filter(d => d.innings_id === inningsId);

  let totalRuns = 0;
  let totalWickets = 0;
  let legalBalls = 0;
  const extrasBreakdown = { w: 0, nb: 0, b: 0, lb: 0, total: 0 };
  
  const batterMap: Record<string, BatterStats> = {};
  const bowlerMap: Record<string, BowlerStats> = {};

  // Find the current active batters/bowlers based on the last few deliveries,
  // or they need to be tracked. The useScoringEngine has this state explicitly.
  // For the public view, we can derive the current batters/bowlers by looking at the last delivery.
  let currentBatterId: string | null = null;
  let nonStrikerId: string | null = null;
  let currentBowlerId: string | null = null;

  if (inningsDeliveries.length > 0) {
    const lastD = inningsDeliveries[inningsDeliveries.length - 1];
    currentBatterId = lastD.batter_id;
    nonStrikerId = lastD.non_striker_id;
    currentBowlerId = lastD.bowler_id;
  }

  inningsDeliveries.forEach(d => {
    // Init maps
    if (!batterMap[d.batter_id]) batterMap[d.batter_id] = { id: d.batter_id, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0, out: false };
    if (!bowlerMap[d.bowler_id]) bowlerMap[d.bowler_id] = { id: d.bowler_id, overs: 0, balls: 0, runs: 0, wickets: 0, econ: 0 };

    const btr = batterMap[d.batter_id];
    const bwl = bowlerMap[d.bowler_id];

    // Wickets
    if (d.wicket_type) {
      totalWickets += 1;
      if (d.out_batter_id) {
          if (!batterMap[d.out_batter_id]) batterMap[d.out_batter_id] = { id: d.out_batter_id, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0, out: false };
          batterMap[d.out_batter_id].out = true;
      }
      if (d.wicket_type !== 'run_out') {
        bwl.wickets += 1;
      }
    }

    // Extras & Runs calculation
    let teamRunsAdded = d.runs_scored;
    const isWide = d.extras === 'wide';
    const isNoBall = d.extras === 'no_ball';
    const isBye = d.extras === 'bye';
    const isLegBye = d.extras === 'leg_bye';

    if (isWide || isNoBall) teamRunsAdded += 1; // Penalty
    totalRuns += teamRunsAdded;

    // Extras breakdown
    if (isWide) { extrasBreakdown.w += 1 + d.runs_scored; extrasBreakdown.total += 1 + d.runs_scored; }
    if (isNoBall) { extrasBreakdown.nb += 1; extrasBreakdown.total += 1; }
    if (isBye) { extrasBreakdown.b += d.runs_scored; extrasBreakdown.total += d.runs_scored; }
    if (isLegBye) { extrasBreakdown.lb += d.runs_scored; extrasBreakdown.total += d.runs_scored; }

    // Batter Stats
    if (!isWide) {
      btr.balls += 1; // Wides don't count as balls faced
      if (!isBye && !isLegBye) {
        btr.runs += d.runs_scored;
        if (d.runs_scored === 4) btr.fours += 1;
        if (d.runs_scored === 6) btr.sixes += 1;
      }
    }

    // Bowler Stats
    if (!isWide && !isNoBall) {
      bwl.balls += 1;
      legalBalls += 1;
    }
    
    // Bowler runs conceded
    if (isWide) {
      bwl.runs += (1 + d.runs_scored);
    } else if (isNoBall) {
      bwl.runs += (1 + (!isBye && !isLegBye ? d.runs_scored : 0));
    } else if (!isBye && !isLegBye) {
      bwl.runs += d.runs_scored;
    }
  });

  // Finalize Derived Math
  Object.values(batterMap).forEach(b => {
    b.sr = b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(1)) : 0;
  });
  Object.values(bowlerMap).forEach(b => {
    b.overs = Math.floor(b.balls / 6);
    const partial = b.balls % 6;
    const totalOversDec = b.overs + (partial / 6);
    b.econ = totalOversDec > 0 ? Number(((b.runs / totalOversDec)).toFixed(2)) : 0;
  });

  const completedOvers = Math.floor(legalBalls / 6);
  const ballsInCurrentOver = legalBalls % 6;
  
  const reachedTarget = targetScore !== null && totalRuns >= targetScore;
  const isInningsComplete = isDeclared || completedOvers >= maxOvers || totalWickets >= 10 || reachedTarget;

  // Compute Timeline for the current over
  const currentOverDeliveries = inningsDeliveries.filter(d => d.over_number === completedOvers);
  const currentOverTimeline: TimelineEvent[] = currentOverDeliveries.map(d => {
    let label = d.runs_scored.toString();
    let isExtra = false;

    if (d.extras === 'wide') { label = `${d.runs_scored + 1}WD`; isExtra = true; }
    else if (d.extras === 'no_ball') { label = `${d.runs_scored + 1}NB`; isExtra = true; }
    else if (d.extras === 'bye') { label = `${d.runs_scored}B`; isExtra = true; }
    else if (d.extras === 'leg_bye') { label = `${d.runs_scored}LB`; isExtra = true; }
    else if (d.runs_scored === 0 && !d.wicket_type) { label = '•'; }

    return {
      id: d.id,
      label: d.wicket_type ? 'W' : label,
      isWicket: !!d.wicket_type,
      isBoundary: d.runs_scored === 4 || d.runs_scored === 6,
      isExtra
    }
  });

  return { 
    totalRuns, 
    totalWickets, 
    completedOvers, 
    ballsInCurrentOver, 
    extrasBreakdown, 
    batterMap, 
    bowlerMap, 
    currentOverTimeline, 
    isInningsComplete,
    isDeclared,
    inferredCurrentBatterId: currentBatterId,
    inferredNonStrikerId: nonStrikerId,
    inferredCurrentBowlerId: currentBowlerId
  };
}
