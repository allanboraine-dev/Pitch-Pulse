'use client'

import { useTransition } from 'react'
import { approvePlayer } from '@/app/actions/auth'

export default function ApproveButton({ playerId }: { playerId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => approvePlayer(playerId))}
      disabled={isPending}
      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? 'Approving...' : 'Approve'}
    </button>
  )
}
