import { useState, useRef, useMemo, useEffect } from 'react'
import { CARRIERS, eligibleCarriers, PROJECT_TYPE_CONFIG } from '../lib/projectTypeConfig'
import oneshotLogo from '../assets/oneshot-logo.png'
import rivetLogo from '../assets/rivet-navigators.svg'

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

// Carrier logo chip — real logo when we have one, otherwise an initials
// monogram. Match by name (e.g. "Great American (OneShot)").
const CARRIER_LOGOS = {
  'great american': oneshotLogo,
  'navigators (the hartford)': rivetLogo,
}
function CarrierMark({ name, size = 'sm' }) {
  const dim = size === 'lg' ? 56 : 40
  const key = (name || '').toLowerCase()
  const logo = CARRIER_LOGOS[key]
  // Rivet wordmark is wide — let it fill more of the badge so it reads.
  const isWideLogo = key === 'navigators (the hartford)'
  if (logo) {
    return (
      <div
        className="rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
        style={{ width: dim, height: dim, background: 'white', border: '1px solid #E5E7EB' }}
      >
        <img
          src={logo}
          alt={name}
          style={{
            width: isWideLogo ? '85%' : '70%',
            height: isWideLogo ? '85%' : '70%',
            objectFit: 'contain',
          }}
        />
      </div>
    )
  }
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

// Steps that show in the right rail during the quote flow (Compare →
// Bind). Simpler than GL-Bop's 4-step Package/Add-Ons flow because BR's
// Compare page goes straight to Submission once the user clicks Bind.
const QUOTE_STEPS = [
  { id: 'select', n: 1, label: 'Select Carrier' },
  { id: 'bind',   n: 2, label: 'Bind & Issue' },
]

export default function RightPanel({ onFormReview, onDownloadSummary, formData = {}, isDark = false, projectType, state, inSubmission = false, inCompare = false, selectedCarrierId = null }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()
  // User-promoted carrier — clicking a non-hero row in the list pins it
  // as the hero card. Falls back to quotes[0] (cheapest) if unset or if
  // the picked carrier disappears (e.g. project type changes).
  const [preferredId, setPreferredId] = useState(null)

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
          {inSubmission ? 'Bind Received' : 'Quote in Progress'}
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
          <span className="text-xs font-bold text-gradient">{inSubmission ? 100 : progressPct}%</span>
        </div>

        {/* Progress bar — full when submitted, otherwise reflects form completion */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${inSubmission ? 100 : progressPct}%`, background: BRAND_GRADIENT }} />
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* ============================ Submission Status (after submit) ============================ */}
        {inSubmission && (
          <div className="mb-5">
            {/* What's Next? — same copy as GL-Bop / commercial-auto */}
            <h3 className="text-sm font-bold mb-5" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>What's Next?</h3>
            <div className="space-y-6 mb-2">
              {[
                {
                  n: 1,
                  title: 'Review & Processing',
                  desc: 'Your application will be reviewed as soon as possible.',
                },
                {
                  n: 2,
                  title: 'Email Confirmation',
                  desc: "You'll receive detailed policy confirmation via email.",
                },
                {
                  n: 3,
                  title: 'Policy in Force',
                  desc: 'Coverage starts on the effective date you selected.',
                },
              ].map(step => (
                <div key={step.n} className="flex gap-4">
                  <span
                    className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)' }}
                  >
                    <span style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>{step.n}</span>
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{step.title}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================ Live Quotes (pre-submission) ============================ */}
        {!inSubmission && !inCompare && (
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
            // Hero = user-picked carrier if set, otherwise cheapest.
            // Falls back to quotes[0] if the picked id is no longer in the list.
            const top = (preferredId && quotes.find(q => q.id === preferredId)) || quotes[0]
            const isCheapest = top.id === quotes[0].id
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
                  {isCheapest ? 'BEST' : 'SELECTED'}
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

          {/* Remaining carriers list — clicking any row promotes it to the
              hero card so the user can compare estimates side-by-side. */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
              : (() => {
                  if (!showPrices) return quotes
                  const heroId = (preferredId && quotes.find(q => q.id === preferredId)) ? preferredId : quotes[0].id
                  return quotes.filter(q => q.id !== heroId)
                })().map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => showPrices && setPreferredId(q.id)}
                    disabled={!showPrices}
                    className="w-full rounded-xl px-3 py-3 flex items-center gap-3 text-left transition disabled:cursor-default"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                    }}
                    onMouseEnter={ev => { if (showPrices) ev.currentTarget.style.borderColor = 'rgba(92,46,212,0.35)' }}
                    onMouseLeave={ev => { ev.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
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
                  </button>
                ))
            }
          </div>

          {/* Download Application Summary — placed below the carriers
              list to match GL-Bop's right-rail layout. Only enabled
              once essentials are filled in. */}
          {!inSubmission && (() => {
            return (
              <button
                type="button"
                onClick={() => onDownloadSummary && onDownloadSummary()}
                className="w-full inline-flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-xl text-xs font-bold transition hover:opacity-90"
                style={{ background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                  <line x1="9" y1="17" x2="13" y2="17"/>
                </svg>
                Download Application Summary
              </button>
            )
          })()}
        </div>
        )}

        {/* ============================ Quote-flow summary (Compare stage) ============================ */}
        {/* Mirrors GL-Bop: once the user clicks Get Quotes the right rail
            switches from the carrier list to a focused "selected carrier"
            summary + WHERE YOU ARE step tracker. */}
        {inCompare && (() => {
          const top = quotes.find(q => q.id === selectedCarrierId) || quotes[0]
          const currentIdx = selectedCarrierId ? 0 : 0 // user is on "Select Carrier" until they click Bind
          return (
            <div className="mb-5">
              {/* Selected carrier card */}
              {top ? (
                <div
                  className="rounded-2xl px-5 py-5 mb-5 flex flex-col items-center text-center relative"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                    border: `1.5px solid ${isDark ? 'rgba(124,58,237,0.55)' : '#7C3AED'}`,
                    boxShadow: '0 4px 20px rgba(92,46,212,0.10)',
                  }}
                >
                  <span
                    className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                    style={{ background: BRAND_GRADIENT, boxShadow: '0 2px 6px rgba(92,46,212,0.25)' }}
                  >
                    {selectedCarrierId ? 'SELECTED' : 'BEST'}
                  </span>
                  <CarrierMark name={top.name} size="lg" />
                  <p className="text-base font-bold mt-3" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{top.program}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{top.name}</p>
                  {showPrices && (
                    <div className="mt-4">
                      <span className="text-3xl font-bold" style={{
                        background: BRAND_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>{money(top.premium)}</span>
                      <p className="text-[10px] text-gray-400 mt-1">Annual Premium</p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-2xl px-5 py-8 mb-5 text-center"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                    border: `1px dashed ${isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}`,
                  }}
                >
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Select a carrier on the left to see your quote here.
                  </p>
                </div>
              )}

              {/* WHERE YOU ARE step tracker */}
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-4 pl-0.5">
                  Where you are
                </div>
                <div className="space-y-5">
                  {QUOTE_STEPS.map((step, idx) => {
                    const isCurrent = idx === currentIdx
                    const isDone = idx < currentIdx
                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        <span
                          className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)',
                            ...(isCurrent ? { boxShadow: '0 0 0 3px rgba(124,58,237,0.14)' } : {}),
                            opacity: !isCurrent && !isDone ? 0.55 : 1,
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
                          className="text-sm leading-tight"
                          style={{
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent
                              ? (isDark ? '#F9FAFB' : '#111827')
                              : isDone
                                ? (isDark ? '#D1D5DB' : '#4B5563')
                                : '#9CA3AF',
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Download Application Summary — always active in the
                  quote flow since the form is complete by this point */}
              <button
                type="button"
                onClick={() => onDownloadSummary && onDownloadSummary()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition hover:opacity-90"
                style={{
                  background: BRAND_GRADIENT,
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(92,46,212,0.22)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                  <line x1="9" y1="17" x2="13" y2="17"/>
                </svg>
                Download Application Summary
              </button>
            </div>
          )
        })()}

      </div>
    </aside>
  )
}
