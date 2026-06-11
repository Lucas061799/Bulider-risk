import { useState, useRef, useMemo, useEffect } from 'react'
import { CARRIERS, eligibleCarriers, PROJECT_TYPE_CONFIG } from '../lib/projectTypeConfig'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Generic completion: a bucket counts as "done" if it has any truthy value.
function getSectionCompletion(formData, sectionKeys) {
  const results = {}
  sectionKeys.forEach((key) => {
    const bucket = formData[key]
    if (!bucket) { results[key] = false; return }
    results[key] = Object.values(bucket).some(v => v !== '' && v !== undefined && v !== null && v !== false)
  })
  return results
}

// Builder's Risk premium estimate. Same shape as GL-Bop's — a base figure,
// then per-carrier multipliers. Real ratings will come from carrier APIs
// later; for now this is a directional UX-only estimate.
function estimatePremium(formData, projectType) {
  const coverage = formData.coverage || {}
  const vacValues = formData.vacValues || {}
  const project = formData.project || formData.vacRisk || {}

  const toNum = (v) => Number(String(v || '').replace(/[^0-9.]/g, '')) || 0

  const cv =
    toNum(coverage.completedValue) ||
    toNum(coverage.remodelValue) ||
    (toNum(coverage.newWorkValue) + toNum(coverage.existingValue)) ||
    (toNum(vacValues.newWorkValue) + toNum(vacValues.existingValue))

  if (cv <= 0) return 0

  // Rate per $1k of insured value
  const isVacant = projectType === 'vacant_dwelling'
  const ratePer1k = isVacant ? 1.20 : 0.45

  // Construction-type multiplier — fire resistive cheaper, frame more expensive
  const ct = (project.constructionType || '').toLowerCase()
  let ctMult = 1.0
  if (ct.includes('fire')) ctMult = 0.85
  else if (ct.includes('frame') || ct.includes('wood')) ctMult = 1.15
  else if (ct.includes('masonry') || ct.includes('non-combust')) ctMult = 0.95
  else if (ct.includes('steel')) ctMult = 0.90

  // Duration multiplier
  const dur = project.duration || ''
  let durMult = 1.0
  if (dur.includes('3')) durMult = 0.65
  else if (dur.includes('6')) durMult = 0.85
  else if (dur.includes('12')) durMult = 1.0

  return Math.max((cv / 1000) * ratePer1k * ctMult * durMult, 300)
}

// Carrier per-program multiplier (illustrative)
const CARRIER_MULTIPLIER = {
  gaic: 1.00,
  navigators: 1.08,
  atrium: 0.95,
}

const money = (n) => '$' + Math.round(n).toLocaleString()

function LoadingPriceTicker({ isDark = false }) {
  return (
    <div
      className="shrink-0 relative flex items-center justify-center"
      style={{ width: 24, height: 24 }}
      title="Calculating quote…"
      aria-label="Calculating quote"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute inset-0 animate-spin" style={{ animationDuration: '1.1s' }}>
        <defs>
          <linearGradient id="rpSpinG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke={isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'} strokeWidth="2"/>
        <path d="M22 12a10 10 0 0 0-10-10" stroke="url(#rpSpinG)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="relative text-[11px] font-bold" style={{
        background: BRAND_GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>$</span>
    </div>
  )
}

function SkeletonRow({ isDark = false }) {
  const skelClass = isDark ? 'skel-dark' : 'skel'
  return (
    <div
      className="rounded-xl px-3 py-3 flex items-center gap-3"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
      }}
    >
      <div className={`${skelClass} w-9 h-9 rounded-xl shrink-0`} />
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className={`${skelClass} h-3 rounded w-14`} />
        <div className={`${skelClass} h-3 rounded w-12`} />
      </div>
      <style>{`
        .skel { background: linear-gradient(90deg, #EEF2F7 0%, #F8FAFC 50%, #EEF2F7 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        .skel-dark { background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        @keyframes skelShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}

// Small monogram chip used in place of a real carrier logo for now
function CarrierMark({ name, size = 'sm' }) {
  const dim = size === 'lg' ? 56 : 40
  const initials = name.split(/[\s(]/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0 font-bold"
      style={{
        width: dim,
        height: dim,
        background: 'white',
        border: '1px solid #E5E7EB',
        fontSize: size === 'lg' ? 16 : 13,
        color: '#5C2ED4',
      }}
    >
      {initials}
    </div>
  )
}

export default function RightPanel({ onFormReview, formData = {}, isDark = false, projectType, state, inSubmission = false }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const cfg = projectType ? PROJECT_TYPE_CONFIG[projectType] : null
  const sectionKeys = cfg?.steps?.map(s => s.key) || []
  const totalCount = sectionKeys.length || 1
  const completion = getSectionCompletion(formData, sectionKeys)
  const completedCount = Object.values(completion).filter(Boolean).length
  const progressPct = Math.round((completedCount / totalCount) * 100)

  // Eligible carriers for this risk × state combo
  const carrierIds = useMemo(
    () => eligibleCarriers(projectType, (state || formData.applicant?.state || '').toUpperCase()),
    [projectType, state, formData.applicant?.state]
  )

  const base = useMemo(() => estimatePremium(formData, projectType), [formData, projectType])
  const showPrices = base > 0
  const readyToQuote = carrierIds.length > 0

  // Sort cheapest-first; the hero card is the BEST price
  const quotes = useMemo(() => {
    return carrierIds
      .map(id => Object.values(CARRIERS).find(c => c.id === id))
      .filter(Boolean)
      .map(c => ({ ...c, premium: base * (CARRIER_MULTIPLIER[c.id] || 1) }))
      .sort((a, b) => a.premium - b.premium)
  }, [carrierIds, base])

  // Brief skeleton shimmer when carriers list flips from empty → ready,
  // or when base premium first becomes available.
  const [priming, setPriming] = useState(false)
  useEffect(() => {
    if (readyToQuote && showPrices) {
      setPriming(true)
      const t = setTimeout(() => setPriming(false), 900)
      return () => clearTimeout(t)
    }
  }, [readyToQuote, showPrices])
  const showSkeleton = !readyToQuote || priming

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map(f => ({ name: f.name, size: f.size, id: Math.random() }))
    setFiles(prev => [...prev, ...arr])
  }
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))
  const formatSize = (bytes) => bytes < 1024 ? bytes + ' bytes' : Math.round(bytes / 1024) + ' KB'

  return (
    <aside
      className="w-80 2xl:w-96 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav">

        {/* Title */}
        <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : undefined }}>
          {inSubmission ? 'Submission Status' : 'Quote in Progress'}
        </h2>

        {/* Auto-saved + % row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="autoGradRP" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                  <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                </linearGradient>
              </defs>
              <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradRP)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradRP)" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-medium text-gradient">All progress auto-saved</span>
          </div>
          <span className="text-xs font-bold text-gradient">{progressPct}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: BRAND_GRADIENT }} />
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* ============================ Submission Status (after submit) ============================ */}
        {inSubmission && (
          <div className="mb-5">
            {/* Submitted hero card */}
            <div
              className="rounded-2xl px-5 py-5 mb-4 flex flex-col items-center text-center"
              style={{
                background: isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.06)',
                border: `1.5px solid ${isDark ? '#A78BFA' : '#7C3AED'}`,
                boxShadow: '0 4px 20px rgba(92,46,212,0.10)',
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, rgba(115,201,183,0.22), rgba(92,46,212,0.10))' }}>
                <svg className="w-6 h-6" fill="none" stroke="#0D8B73" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Application Submitted
              </p>
              <p className="text-[13px] font-semibold mt-1" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>
                Awaiting carrier selection
              </p>
            </div>

            {/* Next steps */}
            <div className="mb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF' }}>
                Next Steps
              </p>
              <div className="space-y-4">
                {[
                  { n: 1, label: 'Select a carrier', done: false, active: true },
                  { n: 2, label: 'Firm quote returns', done: false, active: false },
                  { n: 3, label: 'Bind & issue', done: false, active: false },
                ].map(step => (
                  <div key={step.n} className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(88.09deg, rgba(92,46,212,0.18) 0%, rgba(166,20,195,0.18) 100%)',
                        ...(step.active ? { boxShadow: '0 0 0 3px rgba(124,58,237,0.14)' } : {}),
                        opacity: step.active ? 1 : 0.55,
                      }}
                    >
                      <span style={{
                        background: BRAND_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>{step.n}</span>
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        fontWeight: step.active ? 700 : 500,
                        color: step.active ? (isDark ? '#F9FAFB' : '#111827') : '#9CA3AF',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================ Live Quotes (pre-submission) ============================ */}
        {!inSubmission && (
        <div className="mb-5">
          {/* Hero best-price card */}
          {showSkeleton ? (
            <div
              className="rounded-2xl px-5 py-6 mb-3 flex flex-col items-center gap-3"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <div className={`${isDark ? 'skel-dark' : 'skel'} w-14 h-14 rounded-xl`} />
              <div className={`${isDark ? 'skel-dark' : 'skel'} h-8 w-32 rounded`} />
              <div className={`${isDark ? 'skel-dark' : 'skel'} h-3 w-20 rounded`} />
            </div>
          ) : showPrices ? (() => {
            const top = quotes[0]
            return (
              <div
                className="w-full rounded-2xl px-5 py-5 mb-3 flex flex-col items-center text-center relative overflow-hidden"
                style={{
                  background: 'white',
                  border: '1.5px solid #7C3AED',
                  boxShadow: '0 4px 20px rgba(92,46,212,0.10)',
                }}
              >
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white" style={{ background: BRAND_GRADIENT }}>
                  BEST
                </div>
                <CarrierMark name={top.name} size="lg" />
                <div className="mt-3">
                  <span className="text-3xl font-bold" style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {money(top.premium)}
                  </span>
                </div>
                <p className="text-[12px] font-semibold mt-1" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
                  {top.program}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{top.name}</p>
                <p className="text-[10px] text-gray-400 mt-2">Estimated Premium</p>
              </div>
            )
          })() : (
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              {readyToQuote
                ? 'Enter completed value to see live estimates.'
                : 'Select a project type and state to see live estimates.'}
            </p>
          )}

          {/* Remaining carriers list */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
              : (showPrices ? quotes.slice(1) : quotes).map(q => (
                  <div
                    key={q.id}
                    className="w-full rounded-xl px-3 py-3 flex items-center gap-3"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                    }}
                  >
                    <CarrierMark name={q.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>
                        {q.program}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{q.name}</p>
                    </div>
                    {showPrices ? (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                          {money(q.premium)}
                        </div>
                        <div className="text-[9px] text-gray-400">per term</div>
                      </div>
                    ) : (
                      <LoadingPriceTicker isDark={isDark} />
                    )}
                  </div>
                ))
            }
          </div>
        </div>
        )}


      </div>
    </aside>
  )
}
