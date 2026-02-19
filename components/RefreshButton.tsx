'use client'
import { useState } from 'react'

export function RefreshButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const trigger = async () => {
    setState('loading')
    try {
      await fetch('/api/signals/collect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` }
      })
      setState('done')
      setTimeout(() => { setState('idle'); window.location.reload() }, 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <button onClick={trigger} disabled={state === 'loading'}
      className="text-[11px] tracking-widest px-4 py-2 border border-emerald-500/25 text-emerald-500 rounded hover:bg-emerald-500/10 disabled:opacity-40 transition-all font-mono">
      {state === 'idle'    && '⟳ REFRESH SIGNALS'}
      {state === 'loading' && '⟳ COLLECTING...'}
      {state === 'done'    && '✓ DONE'}
    </button>
  )
}