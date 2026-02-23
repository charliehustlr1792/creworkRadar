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
      backgroundColor: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(6px)',
      padding: '16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb' }}>
          <div>
            <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#16a34a', letterSpacing: '3px', marginBottom: '3px' }}>COLLECTION COMPLETE</div>
            <div style={{ color: '#111827', fontWeight: 600, fontSize: '14px', fontFamily: 'monospace' }}>Signal Collection Report</div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#16a34a', fontSize: '13px' }}>✓</span>
          </div>
        </div>

        {/* Total signals */}
        <div style={{ padding: '28px 22px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '52px', fontWeight: 700, fontFamily: 'monospace', color: '#16a34a', lineHeight: 1 }}>{result.collected}</div>
          <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '3px', marginTop: '8px' }}>SIGNALS COLLECTED</div>
        </div>

        {/* Sources */}
        <div style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#9ca3af', letterSpacing: '3px', marginBottom: '14px' }}>BREAKDOWN BY SOURCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(result.sources).length > 0
              ? Object.entries(result.sources).map(([src, count]) => (
                <div key={src} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, padding: '2px 7px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '3px' }}>
                      {src.slice(0, 2).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{SOURCE_META[src] ?? src}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((Number(count) / result.collected) * 100, 100)}%`, background: '#34d399', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#374151', minWidth: '24px', textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              ))
              : <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>No source data</div>
            }
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#f9fafb' }}>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', margin: 0 }}>AI pipeline running in background</p>
          <button
            onClick={closeModal}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
            style={{
              fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px',
              padding: '10px 18px',
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              color: '#16a34a', borderRadius: '8px', cursor: 'pointer',
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
        className="relative flex items-center gap-2 text-[10px] sm:text-[11px] tracking-widest px-3 sm:px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-all font-mono bg-white shadow-sm"
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
          <span className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-emerald-400 to-transparent animate-pulse rounded" />
        )}
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}