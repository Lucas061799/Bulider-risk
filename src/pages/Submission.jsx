import { useState, useEffect } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import norbielinkLogoDark from '../assets/norbielink-logo-dark.png'
import btisLogo from '../assets/btislogo.png'
import btisLogoDark from '../assets/btislogo-dark.png'
import norbieface from '../assets/norbieface.png'
import sellMoreBg from '../assets/sell-more-bg.png'
import Sidebar from '../components/Sidebar'
import RightPanel from '../components/RightPanel'
import { PROJECT_TYPE_CONFIG, CARRIERS, calcPolicyFee } from '../lib/projectTypeConfig'

const GR = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Stable per-session submission id
let _cachedSubmissionId = null
function getSubmissionId() {
  if (_cachedSubmissionId) return _cachedSubmissionId
  _cachedSubmissionId = 'BR' + Math.floor(1000000 + Math.random() * 9000000)
  return _cachedSubmissionId
}

// Confetti shower — fires once on mount
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: ['#5C2ED4','#A614C3','#ACD697','#75C9B7','#FFD700','#FF6B6B','#4ECDC4'][i % 7],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute', left: `${p.left}%`, top: '-20px',
            width: p.size, height: p.size, background: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`, opacity: 0,
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

const money = (n) => '$' + Math.round(n).toLocaleString()

export default function Submission({ formData, projectType, state, boundCarrier, onBack, isDark, onToggleDark }) {
  const submissionId = getSubmissionId()
  const cfg = PROJECT_TYPE_CONFIG[projectType]
  const applicant = formData.applicant || {}
  const projectStateAbbr = (state || applicant.state || '').toUpperCase()
  const flowTitle = cfg?.shortLabel || "Builder's Risk"
  const STEPS = cfg?.steps || []

  // Atrium → "Quote Only" path; everyone else → bound on platform
  const isAtrium = boundCarrier?.id === 'atrium'
  const headerKicker = isAtrium ? 'Sent to Atrium for Review' : 'Bind Submitted'
  const headerTitle = isAtrium ? 'Quote requested!' : 'Bind submitted!'
  const headerCopy = isAtrium
    ? `Atrium will review and reach out with a firm quote within 1–2 business days.`
    : `${boundCarrier?.name || 'The carrier'} is processing the bind. You'll get a confirmation email shortly.`

  const policyFee = boundCarrier ? calcPolicyFee(boundCarrier.id, boundCarrier.premium || 0) : 0
  const total = (boundCarrier?.premium || 0) + policyFee

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: isDark ? '#131629' : 'white' }}>
      <Confetti />

      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: isDark ? '#191D35' : 'white',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-5 md:w-64 2xl:md:w-72 md:shrink-0">
          <button onClick={onBack} className="md:hidden mr-3 p-1.5 rounded-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/' }}
            className="focus:outline-none"
            title="Back to start"
          >
            <img src={isDark ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-8" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-8">
          <span className="text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={isDark ? btisLogoDark : btisLogo} alt="btis" className="h-7" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            steps={STEPS}
            activeStep={STEPS.length + 1}
            onStepClick={(id) => { if (id <= STEPS.length) onBack() }}
            formData={formData}
            onCheckErrors={() => {}}
            showSubmission={true}
            bound={true}
            isDark={isDark}
            onToggleDark={onToggleDark}
            flowTitle={flowTitle}
            projectType={projectType}
          />
        </div>

        <main className="flex-1 overflow-y-auto custom-scroll" style={{ background: isDark ? '#131629' : 'white' }}>
          <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-5 md:space-y-6">

            {/* Submission Complete Card — commercial-auto / GL pattern:
                gradient top bar + inline icon/title row + horizontal info grid */}
            <div className="rounded-2xl overflow-hidden" style={{ background: isDark ? '#1A1E38' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}>
              {/* Gradient top accent bar */}
              <div className="h-1" style={{ background: GR }} />

              {/* Header row — gradient-tinted check circle + title + description */}
              <div className="flex items-start gap-4 px-6 pt-5 pb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(88.09deg, rgba(92,46,212,0.45) 0%, rgba(166,20,195,0.45) 100%)'
                      : 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="subCheckG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path d="M5 13l4 4L19 7" stroke="url(#subCheckG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold mb-1" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{headerTitle}</h1>
                  <p className="text-xs text-gray-400 leading-relaxed">{headerCopy}</p>
                </div>
              </div>

              {/* Info row — 4 metrics. divide-gray-100 picks up the dark-mode
                  border-color override from index.css automatically. */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100"
                style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
              >
                {[
                  { label: 'Submission ID', value: submissionId },
                  { label: 'Date',          value: 'Today' },
                  { label: 'Project Type',  value: cfg?.shortLabel || cfg?.label || projectType },
                  { label: 'Status',
                    value: isAtrium ? 'Quote Pending' : 'Bind in Progress',
                    highlight: true },
                ].map(item => (
                  <div key={item.label} className="px-5 py-4">
                    <p className="text-[10px] text-gray-400 mb-1">{item.label}</p>
                    {item.highlight
                      ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: GR }} />
                          <p className="text-sm font-semibold" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.value}</p>
                        </span>
                      )
                      : <p className="text-sm font-semibold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{item.value}</p>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Selected carrier card */}
            {boundCarrier && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isDark ? '#1A1E38' : 'white',
                  border: `1.5px solid ${isDark ? 'rgba(166,20,195,0.55)' : '#A614C3'}`,
                  boxShadow: '0 8px 28px rgba(166,20,195,0.10)',
                }}
              >
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: '#9CA3AF' }}>{boundCarrier.program}</p>
                    <h3 className="text-base font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{boundCarrier.name}</h3>
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded"
                    style={{
                      background: boundCarrier.type === 'Admitted' ? 'rgba(115,201,183,0.18)' : 'rgba(252,165,165,0.18)',
                      color: boundCarrier.type === 'Admitted' ? '#0D8B73' : '#B91C1C',
                    }}
                  >
                    {boundCarrier.type}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Estimated Premium</p>
                  <p className="text-3xl font-bold mb-3" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {money(boundCarrier.premium || 0)}
                  </p>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Policy Fee</span><span className="font-medium" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{money(policyFee)}</span></div>
                    <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Commission</span><span className="font-medium" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{Math.round((boundCarrier.commission || 0) * 100 * 10) / 10}%</span></div>
                    <div className="flex justify-between pt-2 mt-1" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}` }}>
                      <span className="font-semibold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>Total Due</span>
                      <span className="font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{money(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Return to the Jungle CTA — same pattern as commercial-auto / GL */}
            <div
              className="rounded-2xl relative cursor-pointer hover:opacity-95 transition overflow-hidden mb-8"
              onClick={onBack}
              style={{ minHeight: '100px' }}
            >
              <img src={sellMoreBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="px-8 py-6 relative z-10">
                <p className="text-lg font-bold mb-1" style={{ color: '#111827' }}>Return to the Jungle?</p>
                <p className="text-xs text-gray-400">Head back to <span className="font-semibold text-gradient underline underline-offset-2">Norbielink</span></p>
              </div>
            </div>
          </div>
        </main>

        <div className="hidden lg:block">
          <RightPanel
            formData={formData}
            isDark={isDark}
            projectType={projectType}
            state={state}
            inSubmission={true}
            onFormReview={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
