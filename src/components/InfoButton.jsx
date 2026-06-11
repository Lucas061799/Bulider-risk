import { useState, useRef, useEffect } from 'react'

// Reusable "IE" (info / explainer) button.
// Pass title + body (string or JSX). Body supports markdown-ish via plain JSX children.
//
// Usage:
//   <InfoButton title="GL vs Premises Liability">
//     <p>General Liability is broader...</p>
//   </InfoButton>
export default function InfoButton({ title, children, size = 'sm', label }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const popRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        popRef.current && !popRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const dim = size === 'xs' ? 'w-3.5 h-3.5 text-[8px]' : 'w-4 h-4 text-[10px]'

  return (
    <span className="relative inline-flex items-center" ref={btnRef}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v) }}
        className={`${dim} rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-all hover:scale-110`}
        style={{
          background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)',
          boxShadow: open ? '0 2px 8px rgba(92,46,212,0.4)' : '0 1px 3px rgba(92,46,212,0.25)',
        }}
        title={typeof title === 'string' ? title : undefined}
        aria-label={`More info: ${typeof title === 'string' ? title : 'details'}`}
      >
        i
      </button>
      {label && (
        <span className="text-[11px] text-gray-500 ml-1 select-none">{label}</span>
      )}

      {open && (
        <div
          ref={popRef}
          className="absolute z-50 top-full mt-2 left-0 rounded-xl bg-white shadow-xl"
          style={{
            width: '340px',
            border: '1px solid rgba(92,46,212,0.18)',
            boxShadow: '0 8px 28px rgba(15,10,40,0.16)',
          }}
        >
          <div
            className="px-4 py-3 rounded-t-xl flex items-center justify-between"
            style={{ background: 'linear-gradient(88deg, rgba(92,46,212,0.06), rgba(166,20,195,0.06))' }}
          >
            <h4 className="text-[13px] font-bold text-navy" style={{ color: '#1F1B47' }}>
              {title}
            </h4>
            <button
              onClick={() => setOpen(false)}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(92,46,212,0.07)', color: '#5C2ED4' }}
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="px-4 py-3 text-[12px] text-gray-600 leading-relaxed max-h-80 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </span>
  )
}

// ── Pre-built explainer content blocks ──────────────────────────────────────
// These wrap the legalese from the docx forms so we can drop them in anywhere.

export function NoExistingStructureCoverageInfo() {
  return (
    <div className="space-y-2">
      <p>The policy covers only the new construction / renovation work — not the existing building.</p>
      <p className="font-semibold text-green-700">Covered:</p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li>Materials for the renovation/addition</li>
        <li>Work in progress (new construction)</li>
        <li>Fixtures or improvements being installed</li>
        <li>Damage to the new project from a covered peril (fire, wind, theft)</li>
      </ul>
      <p className="font-semibold text-red-700 pt-1">NOT covered:</p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li>The existing building structure itself</li>
        <li>Any pre-existing portions of the property</li>
        <li>Damage that originates in or affects the old structure</li>
        <li>Losses tied to the building before construction began</li>
      </ul>
    </div>
  )
}

export function GLvsPremisesInfo() {
  return (
    <div className="space-y-2">
      <p><span className="font-semibold">General Liability (GL)</span> is broad coverage: bodily injury, property damage, personal & advertising injury, medical payments.</p>
      <p><span className="font-semibold">Premises Liability</span> covers only injuries caused by the condition of the property (slip on wet floor, trip on uneven surface, etc.).</p>
      <p className="pt-1">Premises liability is a subset of GL — if you already have GL, premises is included.</p>
    </div>
  )
}

export function HorizontalVsVerticalInfo() {
  return (
    <div className="space-y-2">
      <p><span className="font-semibold">Horizontal Renovation:</span> Expansion of the existing footprint at the same level — room additions, building extensions, attached garages. Does NOT add floors.</p>
      <p><span className="font-semibold">Vertical Renovation:</span> Adds height to the structure — new stories, lofts, mezzanines, roof raises, or any modification that adds usable space above/below.</p>
    </div>
  )
}

export function DP1vsDP3Info() {
  return (
    <div className="space-y-2">
      <p><span className="font-semibold">DP-1 (Named Peril):</span> Explicitly lists which perils are covered. If the peril isn't listed, it isn't covered.</p>
      <p><span className="font-semibold">DP-3 (Open Peril):</span> Lists a handful of exclusions; everything else is covered.</p>
      <p className="pt-1 text-gray-500">DP-3 generally provides broader coverage but is more expensive.</p>
    </div>
  )
}
