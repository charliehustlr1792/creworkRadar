'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface PipelineResult {
  collected: number
  sources: Record<string, number>
}

export function RefreshButton() {
  const [state, setState]         = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult]       = useState<PipelineResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const trigger = async () => {
    setState('loading')
    try {
      const res  = await fetch('/api/signals/collect', {
        method:  'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` }
      })
      const data = await res.json()
      setResult({
        collected: data.collected ?? 0,
        sources:   data.sources   ?? {},
      })
      setState('done')
      setShowModal(true)
    } catch {
      setState('idle')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setState('idle')
    window.location.reload()
  }

  const SOURCE_META: Record<string, string> = {
    hackernews: 'HackerNews',
    reddit:     'Reddit',
    serpapi:    'SerpAPI',
  }

  const modal = showModal && result ? (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      padding: '16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#0a0c0a',
        border: '1px solid rgba(52,211,153,0.12)',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(63,63,70,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#15803d', letterSpacing: '3px', marginBottom: '3px' }}>COLLECTION COMPLETE</div>
            <div style={{ color: '#f4f4f5', fontWeight: 600, fontSize: '14px', fontFamily: 'monospace' }}>Signal Collection Report</div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#34d399', fontSize: '13px' }}>✓</span>
          </div>
        </div>

        {/* Total signals — single big stat */}
        <div style={{ padding: '24px 22px', textAlign: 'center', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'monospace', color: '#34d399', lineHeight: 1 }}>{result.collected}</div>
          <div style={{ fontSize: '10px', color: '#52525b', fontFamily: 'monospace', letterSpacing: '3px', marginTop: '8px' }}>SIGNALS COLLECTED</div>
        </div>

        {/* Sources breakdown */}
        <div style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#52525b', letterSpacing: '3px', marginBottom: '14px' }}>BREAKDOWN BY SOURCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(result.sources).length > 0
              ? Object.entries(result.sources).map(([src, count]) => (
                <div key={src} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, padding: '2px 7px', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)', color: '#34d399', borderRadius: '3px' }}>
                      {src.slice(0, 2).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace' }}>{SOURCE_META[src] ?? src}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Mini bar */}
                    <div style={{ width: '60px', height: '3px', background: 'rgba(63,63,70,0.6)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((Number(count) / result.collected) * 100, 100)}%`, background: '#34d399', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#d4d4d8', minWidth: '24px', textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              ))
              : <div style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace' }}>No source data</div>
            }
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(63,63,70,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontSize: '10px', color: '#52525b', fontFamily: 'monospace', margin: 0 }}>AI pipeline running in background</p>
          <button
            onClick={closeModal}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.08)')}
            style={{
              fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px',
              padding: '10px 18px',
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.22)',
              color: '#34d399', borderRadius: '8px', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'background 0.2s',
            }}
          >
            GOT IT →
          </button>
        </div>

      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={trigger}
        disabled={state === 'loading'}
        className="relative flex items-center gap-2 text-[10px] sm:text-[11px] tracking-widest px-3 sm:px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:border-emerald-600/60 hover:text-emerald-400 hover:bg-emerald-500/5 disabled:opacity-40 transition-all font-mono"
      >
        <span className={state === 'loading' ? 'animate-spin inline-block' : ''}>⟳</span>
        <span className="hidden sm:inline">
          {state === 'idle'    && 'REFRESH SIGNALS'}
          {state === 'loading' && 'COLLECTING...'}
          {state === 'done'    && '✓ DONE'}
        </span>
        <span className="sm:hidden">
          {state === 'idle'    && 'REFRESH'}
          {state === 'loading' && '...'}
          {state === 'done'    && '✓'}
        </span>
        {state === 'loading' && (
          <span className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-emerald-500 to-transparent animate-pulse rounded" />
        )}
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}