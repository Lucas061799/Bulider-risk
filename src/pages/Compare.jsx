import { useState, useMemo } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import norbielinkLogoDark from '../assets/norbielink-logo-dark.png'
import btisLogo from '../assets/btislogo.png'
import btisLogoDark from '../assets/btislogo-dark.png'
import norbieface from '../assets/norbieface.png'
import Sidebar from '../components/Sidebar'
import RightPanel from '../components/RightPanel'
import { CARRIERS, calcPolicyFee, eligibleCarriers, PROJECT_TYPE_CONFIG } from '../lib/projectTypeConfig'

const SUBMISSION_ID = 'BR' + Math.floor(1000000 + Math.random() * 9000000)

function estimatePremium(carrierId, completedValue, isVacant) {
  const cv = Number((completedValue || '').toString().replace(/[^0-9.]/g, '')) || 250000
  const ratePer1k = isVacant ? 1.20 : 0.45
  const base = (cv / 1000) * ratePer1k
  const mult = { gaic: 1.0, navigators: 1.08, atrium: 0.95 }[carrierId] || 1.0
  return Math.round(base * mult)
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: ((i * 7) % 100),
    delay: ((i * 13) % 100) / 100 * 1.5,
    duration: 2 + ((i * 11) % 100) / 100 * 2,
    color: ['#5C2ED4','#A614C3','#ACD697','#75C9B7','#FFD700','#FF6B6B','#4ECDC4'][i % 7],
    size: 6 + ((i * 17) % 100) / 100 * 8,
    rotate: ((i * 23) % 360),
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </div>
  )
}

function Row({ label, value, isDark, bold, small }) {
  return (
    <div className="flex justify-between items-center">
      <span className={small ? 'text-[10.5px]' : 'text-[12px]'} style={{ color: '#9CA3AF' }}>{label}</span>
      <span className={`${bold ? 'font-bold' : 'font-medium'} text-right ${small ? 'text-[10.5px]' : 'text-[12px]'}`} style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>
        {value}
      </span>
    </div>
  )
}

// Compact carrier row — matches GL-Bop's CarrierRow pattern.
// Row 1: brand dot + carrier name + program + admitted badge + chevron
// Row 2: estimated premium + per-month/total + "Select" action button
// Expanded: policy fee / commission / platform breakdown
const BR_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)'

function CarrierCard({ carrier, premium, isSelected, isBest, onSelect, isDark, coverageValue, onCoverageUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [pendingCV, setPendingCV] = useState('')
  const fee = calcPolicyFee(carrier.id, premium)
  const total = premium + fee
  const monthly = Math.round(premium / 12)
  const currentCV = Number((coverageValue || '').toString().replace(/[^0-9.]/g, '')) || 0
  const pendingCVNum = Number((pendingCV || '').toString().replace(/[^0-9.]/g, '')) || 0
  const cvChanged = pendingCV !== '' && pendingCVNum !== currentCV

  const rowBorder = (isSelected || isBest) ? '#7C3AED' : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')
  const rowBg = isDark ? 'rgba(255,255,255,0.04)' : 'white'

  return (
    <div
      className="rounded-lg overflow-hidden transition"
      style={{
        background: rowBg,
        border: `1.5px solid ${rowBorder}`,
        boxShadow: (isSelected || isBest) ? '0 2px 12px rgba(92,46,212,0.12)' : 'none',
      }}
    >
      <div className="px-4 py-3.5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        {/* Row 1 — Carrier + pills + chevron */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: BR_GRADIENT }} />
            <span className="text-sm font-semibold truncate" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
              {carrier.name}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>
              {carrier.program}
            </span>
            {isBest && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                style={{ background: BR_GRADIENT }}
              >
                Best Value
              </span>
            )}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: carrier.type === 'Admitted' ? 'rgba(115,201,183,0.18)' : 'rgba(252,165,165,0.18)',
                color: carrier.type === 'Admitted' ? '#0D8B73' : '#B91C1C',
              }}
            >
              {carrier.type}
            </span>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        {/* Row 2 — Price + action button */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>${premium.toLocaleString()}</span>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>/yr</span>
            </div>
            <div className="text-[11px]" style={{ color: '#9CA3AF' }}>
              ${monthly.toLocaleString()}/mo · Total ${total.toLocaleString()}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="px-4 py-2 rounded-lg text-xs font-bold transition shrink-0"
            style={
              isSelected
                ? { background: BR_GRADIENT, color: '#fff' }
                : { background: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6', color: isDark ? '#D1D5DB' : '#374151' }
            }
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
        </div>
      </div>

      {/* Expanded details — two-column: Fee Breakdown + Customize Coverage */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-3"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Fee breakdown */}
            <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EAEAEA'}` }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">Fee Breakdown</div>
              <Row label="Premium" value={`$${premium.toLocaleString()}`} isDark={isDark} />
              <Row label="Policy Fee" value={`$${fee}`} isDark={isDark} />
              <div className="border-t mt-2 pt-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}>
                <Row label="Total Annual Cost" value={`$${total.toLocaleString()}`} isDark={isDark} bold />
              </div>
            </div>

            {/* Customize coverage — editable Completed Value + Update Price */}
            <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EAEAEA'}` }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">Customize Coverage</div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>
                Completed Value <span className="font-normal text-gray-400">(excluding land)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pendingCV !== '' ? pendingCV : currentCV.toLocaleString()}
                  onChange={(e) => setPendingCV(e.target.value.replace(/[^0-9.]/g, ''))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', background: isDark ? 'rgba(255,255,255,0.04)' : 'white', color: isDark ? '#F9FAFB' : '#111827' }}
                />
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (cvChanged) { onCoverageUpdate(pendingCVNum.toString()); setPendingCV('') } }}
                disabled={!cvChanged}
                className="w-full mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition disabled:cursor-not-allowed"
                style={{
                  background: cvChanged ? BR_GRADIENT : '#D1D5DB',
                  boxShadow: cvChanged ? '0 2px 10px rgba(92,46,212,0.25)' : 'none',
                }}
              >
                Update Price
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Compare({ formData, projectType, state, onBack, onBind, onDownloadSummary, isDark, onToggleDark }) {
  const [selectedCarrier, setSelectedCarrier] = useState(null)

  const applicant = formData.applicant || {}
  const coverage = formData.coverage || {}
  const vacValues = formData.vacValues || {}

  const projectStateAbbr = (state || applicant.state || '').toUpperCase()
  const cfg = PROJECT_TYPE_CONFIG[projectType]
  const flowTitle = cfg?.shortLabel || "Builder's Risk"
  const isVacant = projectType === 'vacant_dwelling'
  const STEPS = cfg?.steps || []

  const initialCompletedValue = coverage.completedValue || coverage.remodelValue || (() => {
    const nw = Number((coverage.newWorkValue || vacValues.newWorkValue || '').toString().replace(/[^0-9.]/g, '')) || 0
    const ex = Number((coverage.existingValue || vacValues.existingValue || '').toString().replace(/[^0-9.]/g, '')) || 0
    return (nw + ex).toString()
  })()
  // Local override so the user can tweak the coverage value per-carrier card
  // and re-price without leaving the Compare page.
  const [completedValue, setCompletedValue] = useState(initialCompletedValue)

  const eligibleIds = useMemo(
    () => eligibleCarriers(projectType, projectStateAbbr),
    [projectType, projectStateAbbr]
  )

  const carriers = eligibleIds.map(id => {
    const c = Object.values(CARRIERS).find(cr => cr.id === id)
    if (!c) return null
    return { ...c, premium: estimatePremium(c.id, completedValue, isVacant) }
  }).filter(Boolean)

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: isDark ? '#131629' : 'white' }}>

      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: isDark ? '#191D35' : 'white',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-3 md:px-5 w-auto md:w-64 2xl:md:w-72 md:shrink-0 gap-2">
          <button onClick={onBack} className="md:hidden p-1.5 rounded-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={onBack} className="focus:outline-none">
            <button
            type="button"
            onClick={() => { window.location.href = '/' }}
            className="focus:outline-none"
            title="Back to start"
          >
            <img src={isDark ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-8" />
          </button>
          </button>
        </div>
        <div className="flex items-center gap-2 px-8">
          <span className="text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={isDark ? btisLogoDark : btisLogo} alt="btis" className="h-7" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — shows the full flow with Submission as the active last step */}
        <div className="hidden md:block shrink-0">
          <Sidebar
            steps={STEPS}
            activeStep={STEPS.length + 1}
            onStepClick={(id) => { if (id <= STEPS.length) onBack() }}
            formData={formData}
            onCheckErrors={() => {}}
            showSubmission={true}
            bound={false}
            isDark={isDark}
            onToggleDark={onToggleDark}
            flowTitle={flowTitle}
            projectType={projectType}
          />
        </div>

        <main className="flex-1 overflow-y-auto custom-scroll" style={{ background: isDark ? '#131629' : 'white' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8">

            {/* Compare header — no "Submission Complete" yet; user hasn't bound */}
            <div className="pb-1">
              <p className="text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{
                background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Compare &amp; Select
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-1.5" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>Compare Your Quotes</h1>
              <p className="text-sm text-gray-500">
                Quote <span className="font-bold">{SUBMISSION_ID}</span> · {cfg?.label || projectType}{projectStateAbbr && ` · ${projectStateAbbr}`}
              </p>
            </div>

            {/* Carrier quote cards */}
            {carriers.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: isDark ? '#191D35' : 'white', border: '1px solid #E5E7EB' }}>
                <img src={norbieface} alt="" className="w-16 h-16 mx-auto mb-3 rounded-full" />
                <p className="text-base font-bold mb-1" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>
                  No quotes available for this state yet.
                </p>
                <p className="text-sm text-gray-500">
                  Our team will reach out about manual quoting options.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1">
                {carriers.map(c => (
                  <CarrierCard
                    key={c.id}
                    carrier={c}
                    premium={c.premium}
                    coverageValue={completedValue}
                    onCoverageUpdate={setCompletedValue}
                    isSelected={selectedCarrier === c.id}
                    onSelect={() => {
                      // Just select — Continue button below triggers bind.
                      // Two-step flow gives the user a moment to confirm
                      // their choice before committing (GL-Bop pattern).
                      setSelectedCarrier(c.id)
                    }}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}

            {/* Continue button — disabled until user picks a carrier. Click
                triggers the actual bind (Submission stage). */}
            {carriers.length > 0 && (() => {
              const picked = carriers.find(c => c.id === selectedCarrier)
              const canContinue = !!picked
              const ctaLabel = !picked
                ? 'Select a Carrier to Continue'
                : picked.id === 'atrium'
                  ? 'Send Quote Request →'
                  : 'Bind & Issue →'
              return (
                <div className="flex justify-between items-center pt-2 pb-6 gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
                    style={{ color: isDark ? '#D1D5DB' : '#374151', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`, background: isDark ? 'transparent' : 'white' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Edit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (canContinue && onBind) onBind(picked) }}
                    disabled={!canContinue}
                    className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                    style={canContinue
                      ? {
                          background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
                          color: '#fff',
                          boxShadow: '0 4px 18px rgba(92,46,212,0.30)',
                        }
                      : {
                          background: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
                          color: isDark ? '#6B7280' : '#9CA3AF',
                          cursor: 'not-allowed',
                        }
                    }
                  >
                    {ctaLabel}
                  </button>
                </div>
              )
            })()}


          </div>
        </main>

        {/* Right panel — Compare stage uses the live-quote panel (not the
            'Application Submitted' view); user hasn't bound yet. */}
        <div className="hidden lg:block">
          <RightPanel
            onFormReview={() => {}}
            onDownloadSummary={onDownloadSummary}
            formData={formData}
            isDark={isDark}
            projectType={projectType}
            state={state}
            inSubmission={false}
            inCompare={true}
            selectedCarrierId={selectedCarrier}
          />
        </div>
      </div>
    </div>
  )
}
