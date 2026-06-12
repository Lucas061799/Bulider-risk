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

function CarrierCard({ carrier, premium, isSelected, onSelect, isDark }) {
  const fee = calcPolicyFee(carrier.id, premium)
  const total = premium + fee
  const commissionDollars = Math.round(premium * carrier.commission)

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer rounded-2xl overflow-hidden transition-all"
      style={{
        border: isSelected
          ? '2px solid #A614C3'
          : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
        background: isDark ? '#191D35' : 'white',
        boxShadow: isSelected ? '0 8px 28px rgba(166,20,195,0.18)' : 'none',
        transform: isSelected ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="px-5 py-4" style={{
        background: isSelected
          ? 'linear-gradient(88.09deg, rgba(92,46,212,0.08) 0%, rgba(166,20,195,0.08) 100%)'
          : 'transparent',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>{carrier.program}</p>
            <h3 className="text-[15px] font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{carrier.name}</h3>
          </div>
          <span
            className="text-[9px] font-bold tracking-wide px-2 py-0.5 rounded"
            style={{
              background: carrier.type === 'Admitted' ? 'rgba(115,201,183,0.18)' : 'rgba(252,165,165,0.18)',
              color: carrier.type === 'Admitted' ? '#0D8B73' : '#B91C1C',
            }}
          >
            {carrier.type}
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Estimated Premium</p>
        <p className="text-3xl font-bold mb-3" style={{
          background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ${premium.toLocaleString()}
        </p>

        <div className="space-y-1.5 text-[12px]">
          <Row label="Policy Fee" value={`$${fee}`} isDark={isDark} />
          <Row label="Commission" value={`${(carrier.commission * 100).toFixed(1)}% · $${commissionDollars.toLocaleString()}`} isDark={isDark} />
          <Row label="Platform" value={carrier.platformFunctionality} isDark={isDark} small />
          <div className="pt-1.5 mt-1.5" style={{ borderTop: isDark ? '1px dashed rgba(255,255,255,0.08)' : '1px dashed #E5E7EB' }}>
            <Row label="Total" value={`$${total.toLocaleString()}`} isDark={isDark} bold />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={
            isSelected
              ? { background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', boxShadow: '0 4px 16px rgba(92,46,212,0.3)' }
              : { background: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6', color: isDark ? '#9CA3AF' : '#6B7280' }
          }
        >
          {isSelected ? (carrier.id === 'atrium' ? 'Send to Atrium (Quote Only)' : 'Bind This Quote →') : 'Select'}
        </button>
      </div>
    </div>
  )
}

export default function Compare({ formData, projectType, state, onBack, onBind, isDark, onToggleDark }) {
  const [selectedCarrier, setSelectedCarrier] = useState(null)

  const applicant = formData.applicant || {}
  const coverage = formData.coverage || {}
  const vacValues = formData.vacValues || {}

  const projectStateAbbr = (state || applicant.state || '').toUpperCase()
  const cfg = PROJECT_TYPE_CONFIG[projectType]
  const flowTitle = cfg?.shortLabel || "Builder's Risk"
  const isVacant = projectType === 'vacant_dwelling'
  const STEPS = cfg?.steps || []

  const completedValue = coverage.completedValue || coverage.remodelValue || (() => {
    const nw = Number((coverage.newWorkValue || vacValues.newWorkValue || '').toString().replace(/[^0-9.]/g, '')) || 0
    const ex = Number((coverage.existingValue || vacValues.existingValue || '').toString().replace(/[^0-9.]/g, '')) || 0
    return (nw + ex).toString()
  })()

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

            {/* Top breadcrumb — back link sits above the header, like GL-Bop's
                "Edit answers" affordance. Replaces the bottom-centered back link. */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition hover:opacity-70 -mt-2"
              style={{ color: isDark ? '#A78BFA' : '#5C2ED4' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Edit application
            </button>

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
              <div className={`grid gap-4 ${carriers.length === 1 ? 'grid-cols-1' : carriers.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {carriers.map(c => (
                  <CarrierCard
                    key={c.id}
                    carrier={c}
                    premium={c.premium}
                    isSelected={selectedCarrier === c.id}
                    onSelect={() => {
                      // Selecting acts as bind/submit — Atrium routes to manual quote, others bind directly
                      setSelectedCarrier(c.id)
                      if (onBind) onBind(c)
                    }}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}


          </div>
        </main>

        {/* Right panel — Compare stage uses the live-quote panel (not the
            'Application Submitted' view); user hasn't bound yet. */}
        <div className="hidden lg:block">
          <RightPanel
            onFormReview={() => {}}
            formData={formData}
            isDark={isDark}
            projectType={projectType}
            state={state}
            inSubmission={false}
            inCompare={true}
          />
        </div>
      </div>
    </div>
  )
}
