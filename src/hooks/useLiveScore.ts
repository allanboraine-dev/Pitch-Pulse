import { useState, useEffect, useMemo } from 'react'
import { DeliveryEvent, TeamInfo } from '@/hooks/useScoringEngine'
import { computeScoreStats } from '@/utils/scoring'
import { createClient } from '@/utils/supabase/client'

export function useLiveScore(matchId: string, maxOvers: number) {
  const [deliveries, setDeliveries] = useState<DeliveryEvent[]>([])
  const [activeMatchState, setActiveMatchState] = useState<{ striker_id: string | null, non_striker_id: string | null, bowler_id: string | null }>({
    striker_id: null,
    non_striker_id: null,
    bowler_id: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 1. Fetch initial deliveries
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      if (data && !error) {
        setDeliveries(data as DeliveryEvent[])
      }
      setIsLoading(false)
    }

    fetchInitialData()

    // 2. Subscribe to realtime updates
    const channel = supabase.channel(`live-score-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deliveries',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setDeliveries((prev) => [...prev, payload.new as DeliveryEvent])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const m = payload.new as any;
          setActiveMatchState({
            striker_id: m.current_batter_id || null,
            non_striker_id: m.current_non_striker_id || null,
            bowler_id: m.current_bowler_id || null
          })
        }
      )
      .subscribe()

    // 3. Fetch initial match state
    const fetchMatchState = async () => {
      const { data } = await supabase
        .from('matches')
        .select('current_batter_id, current_non_striker_id, current_bowler_id')
        .eq('id', matchId)
        .single()
      
      if (data) {
        setActiveMatchState({
          striker_id: data.current_batter_id || null,
          non_striker_id: data.current_non_striker_id || null,
          bowler_id: data.current_bowler_id || null
        })
      }
    }
    fetchMatchState()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  // Derive stats for both innings
  const innings1Stats = useMemo(() => {
    return computeScoreStats(deliveries.filter(d => d.innings_id === 1), maxOvers, 1)
  }, [deliveries, maxOvers])

  const innings2Stats = useMemo(() => {
    const target = innings1Stats.totalRuns + 1;
    return computeScoreStats(deliveries.filter(d => d.innings_id === 2), maxOvers, 2, false, target)
  }, [deliveries, maxOvers, innings1Stats.totalRuns])

  return { deliveries, innings1Stats, innings2Stats, isLoading, activeMatchState }
}
