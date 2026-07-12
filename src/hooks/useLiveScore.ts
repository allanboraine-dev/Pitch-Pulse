import { useState, useEffect, useMemo } from 'react'
import { DeliveryEvent, TeamInfo } from '@/hooks/useScoringEngine'
import { computeScoreStats } from '@/utils/scoring'
import { createClient } from '@/utils/supabase/client'

export function useLiveScore(matchId: string, maxOvers: number) {
  const [deliveries, setDeliveries] = useState<DeliveryEvent[]>([])
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  // Derive stats for both innings
  const innings1Stats = useMemo(() => {
    return computeScoreStats(deliveries.filter(d => d.innings_id === 1), maxOvers)
  }, [deliveries, maxOvers])

  const innings2Stats = useMemo(() => {
    return computeScoreStats(deliveries.filter(d => d.innings_id === 2), maxOvers)
  }, [deliveries, maxOvers])

  return { deliveries, innings1Stats, innings2Stats, isLoading }
}
