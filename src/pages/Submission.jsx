import { useState, useEffect } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import norbielinkLogoDark from '../assets/norbielink-logo-dark.png'
import btisLogo from '../assets/btislogo.png'
import btisLogoDark from '../assets/btislogo-dark.png'
import norbieface from '../assets/norbieface.png'
import sellMoreBg from '../assets/sell-more-bg.png'
import iconWorker from '../assets/icon-worker.png'
import iconGL from '../assets/icon-general-liability.png'
import iconBO from '../assets/icon-business-owner.png'
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

// AdditionalInterests bucket now stores { hasParty, entries: [{name, ...}] };
// legacy submissions stored a single {name, ...} object directly on the bucket.
function summarizeParty(bucket) {
  if (!bucket || bucket.hasParty !== 'Yes') return bucket?.hasParty
  const entries = Array.isArray(bucket.entries) && bucket.entries.length
    ? bucket.entries
    : (bucket.name ? [{ name: bucket.name }] : [])
  if (!entries.length) return 'Yes'
  const first = entries[0].name || 'Yes'
  return entries.length > 1 ? `${first} +${entries.length - 1} more` : first
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

// GL-Bop SummarySection pattern — teal soft-circle icon + bold black title +
// clean label/value rows with hairline dividers. White card on light, deep
// navy card on dark. Used inside the Print & View Full Submission overview.
const BLOCK_ICON_PATHS = {
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  pin:      'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  doc:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  card:     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  check:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  users:    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
}

function SummaryBlock({ title, icon = 'shield', children, isDark }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: isDark ? '#252948' : 'white',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(115,201,183,0.12)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={BLOCK_ICON_PATHS[icon] || BLOCK_ICON_PATHS.shield}/>
          </svg>
        </div>
        <h3 className="text-xs font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function SumRow({ label, value, isDark }) {
  if (!value && value !== 0) return null
  return (
    <div
      className="flex items-center justify-between py-1.5"
      style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6'}` }}
    >
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{value}</span>
    </div>
  )
}

export default function Submission({ formData, projectType, state, boundCarrier, onBack, isDark, onToggleDark }) {
  const submissionId = getSubmissionId()
  const cfg = PROJECT_TYPE_CONFIG[projectType]
  const isVacant = projectType === 'vacant_dwelling'

  // BR-flow buckets
  const applicant = formData.applicant || {}
  const project = formData.project || {}
  const contractor = formData.contractor || {}
  const coverage = formData.coverage || {}
  const protection = formData.propertyProtection || {}
  const eligibility = formData.eligibility || {}
  const lossHistory = formData.lossHistory || {}
  const financial = formData.financial || {}
  const existingCov = formData.existingCoverage || {}
  const projectConditions = formData.projectConditions || {}
  const ai = formData.additionalInterests || {}
  const bindConf = formData.bindConfirmation || {}

  // Vacant Dwelling buckets
  const vacRisk = formData.vacRisk || {}
  const vacSystemUpgrades = formData.vacSystemUpgrades || {}
  const vacVacancy = formData.vacVacancy || {}
  const vacPropertyRisk = formData.vacPropertyRisk || {}
  const vacUnderwriting = formData.vacUnderwriting || {}
  const vacValues = formData.vacValues || {}
  const vacContractor = formData.vacContractor || {}
  const vacDeductibles = formData.vacDeductibles || {}
  const vacMaintenance = formData.vacMaintenance || {}
  const vacLoss = formData.vacLoss || {}
  const projectStateAbbr = (state || applicant.state || '').toUpperCase()
  const flowTitle = cfg?.shortLabel || "Builder's Risk"
  const STEPS = cfg?.steps || []

  // Carrier card details collapsed by default — user opens to inspect.
  const [carrierOpen, setCarrierOpen] = useState(false)
  // Print & full submission panel collapsed too.
  const [summaryOpen, setSummaryOpen] = useState(false)
  // Print preview modal — opens on print icon click, lets user review
  // before triggering the actual browser print.
  const [previewOpen, setPreviewOpen] = useState(false)
  const handlePrint = () => setPreviewOpen(true)
  // Print the modal preview body directly — it has #submission-modal-print-area
  // which is targeted by the @media print CSS. Modal chrome (header, footer,
  // backdrop) is .no-print so it stays hidden.
  const triggerPrint = () => { setTimeout(() => window.print(), 50) }

  // Atrium → "Quote Only" path; everyone else → bound on platform
  const isAtrium = boundCarrier?.id === 'atrium'
  const headerKicker = isAtrium ? 'Sent to Atrium for Review' : 'Bind Submitted'
  const headerTitle = isAtrium ? 'Quote requested!' : 'Bind submitted!'
  const headerCopy = isAtrium
    ? `Atrium will review and reach out with a firm quote within 1–2 business days.`
    : `${boundCarrier?.name || 'The carrier'} is processing the bind. You'll get a confirmation email shortly.`

  const policyFee = boundCarrier ? calcPolicyFee(boundCarrier.id, boundCarrier.premium || 0) : 0
  const total = (boundCarrier?.premium || 0) + policyFee

  // Coverage value the user entered — drives the premium upstream. Surfacing
  // it here so the user can see what their entered amount maps to.
  const coverageValueRaw = coverage.completedValue
    || coverage.remodelValue
    || ((Number((coverage.newWorkValue || '').toString().replace(/[^0-9.]/g, '')) || 0)
        + (Number((coverage.existingValue || '').toString().replace(/[^0-9.]/g, '')) || 0))
    || (vacValues.totalCompletedValue
        || ((Number((vacValues.newWorkValue || '').toString().replace(/[^0-9.]/g, '')) || 0)
            + (Number((vacValues.existingValue || '').toString().replace(/[^0-9.]/g, '')) || 0)))
  const coverageValueNum = Number((coverageValueRaw || '').toString().replace(/[^0-9.]/g, '')) || 0

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: isDark ? '#131629' : 'white' }}>
      <Confetti />

      {/* Print preview modal — full submission shown in a popup; user can
          eyeball everything then click Print to trigger window.print(). */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 no-print"
          style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh', background: isDark ? '#1A1E38' : '#F9FAFB' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="shrink-0 px-6 py-4 flex items-center justify-between"
              style={{
                background: isDark ? '#191D35' : 'white',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{
                  background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Submission Preview
                </p>
                <h2 className="text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                  Builder's Risk · {submissionId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition"
                style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`, background: isDark ? 'transparent' : 'white' }}
                onMouseEnter={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.12)' : 'rgba(92,46,212,0.06)'; ev.currentTarget.style.borderColor = 'rgba(92,46,212,0.3)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = isDark ? 'transparent' : 'white'; ev.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="brSubmPrevX" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5C2ED4"/>
                      <stop offset="100%" stopColor="#A614C3"/>
                    </linearGradient>
                  </defs>
                  <path stroke="url(#brSubmPrevX)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body — also serves as the print target */}
            <div id="submission-modal-print-area" className="overflow-y-auto p-5 space-y-3">
              {/* Print-only branding header — hidden on screen, shown on PDF.
                  Matches commercial-auto pattern: logos row + single info row. */}
              <div className="print-only flex-col mb-4">
                {/* Branding row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 8, borderBottom: '1.5px solid #E5E7EB' }}>
                  <img src={norbielinkLogo} alt="NorbieLink" style={{ height: 14, objectFit: 'contain' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 7, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600 }}>POWERED BY</span>
                    <img src={btisLogo} alt="btis" style={{ height: 11, objectFit: 'contain' }} />
                  </div>
                </div>
                {/* Application title + metadata (left) + project category (right) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#5C2ED4' }}>Builder's Risk Application</p>
                    <p style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>#{submissionId} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {isAtrium ? 'Quote Pending' : 'Sold'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 8, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Category</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginTop: 2 }}>{cfg?.label || projectType || '—'}</p>
                  </div>
                </div>
              </div>

              {boundCarrier && (
                <SummaryBlock title="Selected Carrier" icon="card" isDark={isDark}>
                  <SumRow label="Program" value={boundCarrier.program} isDark={isDark}/>
                  <SumRow label="Carrier" value={boundCarrier.name} isDark={isDark}/>
                  <SumRow label="Type" value={boundCarrier.type} isDark={isDark}/>
                  <SumRow label="Coverage Value" value={coverageValueNum > 0 ? money(coverageValueNum) : null} isDark={isDark}/>
                  <SumRow label="Estimated Premium" value={money(boundCarrier.premium || 0)} isDark={isDark}/>
                  <SumRow label="Policy Fee" value={money(policyFee)} isDark={isDark}/>
                  <SumRow label="Commission" value={`${Math.round((boundCarrier.commission || 0) * 100 * 10) / 10}%`} isDark={isDark}/>
                  <SumRow label="Platform" value={boundCarrier.platformFunctionality} isDark={isDark}/>
                  <SumRow label="Total Due" value={money(total)} isDark={isDark}/>
                </SummaryBlock>
              )}

              <SummaryBlock title="Applicant" icon="user" isDark={isDark}>
                <SumRow label="Named Insured" value={applicant.namedInsured} isDark={isDark}/>
                <SumRow label="DBA" value={applicant.dba} isDark={isDark}/>
                <SumRow label="Mailing Address" value={[applicant.address, applicant.suite].filter(Boolean).join(', ')} isDark={isDark}/>
                <SumRow label="City / State / Zip" value={[applicant.city, applicant.state, applicant.zip].filter(Boolean).join(', ')} isDark={isDark}/>
                <SumRow label="Inspection Contact" value={applicant.inspContactName} isDark={isDark}/>
                <SumRow label="Phone" value={applicant.phone} isDark={isDark}/>
                <SumRow label="Email" value={applicant.email} isDark={isDark}/>
                <SumRow label="Business Type" value={applicant.businessType} isDark={isDark}/>
                <SumRow label="Entity Role" value={applicant.entityRole} isDark={isDark}/>
              </SummaryBlock>

              {isVacant ? (
                <>
                  <SummaryBlock title="Risk Information" icon="home" isDark={isDark}>
                    <SumRow label="Effective Date" value={vacRisk.effectiveDate} isDark={isDark}/>
                    <SumRow label="Property Address" value={vacRisk.propertyAddress} isDark={isDark}/>
                    <SumRow label="City / State / Zip" value={[vacRisk.propertyCity, vacRisk.propertyState, vacRisk.propertyZip].filter(Boolean).join(', ')} isDark={isDark}/>
                    <SumRow label="Year Built" value={vacRisk.yearBuilt} isDark={isDark}/>
                    <SumRow label="Square Footage" value={vacRisk.squareFootage} isDark={isDark}/>
                    <SumRow label="Construction Type" value={vacRisk.constructionType} isDark={isDark}/>
                    <SumRow label="Occupancy" value={vacRisk.occupancy} isDark={isDark}/>
                    <SumRow label="Stories" value={vacRisk.stories} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="System Upgrades" icon="check" isDark={isDark}>
                    <SumRow label="Roof Updated" value={vacSystemUpgrades.roofUpdated} isDark={isDark}/>
                    <SumRow label="Roof Year" value={vacSystemUpgrades.roofYear} isDark={isDark}/>
                    <SumRow label="Electrical Updated" value={vacSystemUpgrades.electricalUpdated} isDark={isDark}/>
                    <SumRow label="Plumbing Updated" value={vacSystemUpgrades.plumbingUpdated} isDark={isDark}/>
                    <SumRow label="HVAC Updated" value={vacSystemUpgrades.hvacUpdated} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Vacancy Eligibility" icon="check" isDark={isDark}>
                    <SumRow label="Currently Vacant?" value={vacVacancy.currentlyVacant} isDark={isDark}/>
                    <SumRow label="Vacancy Months" value={vacVacancy.vacancyMonths} isDark={isDark}/>
                    <SumRow label="Continuously Insured" value={vacVacancy.continuouslyInsured} isDark={isDark}/>
                    <SumRow label="Secured Against Entry" value={vacVacancy.secured} isDark={isDark}/>
                    <SumRow label="Multiple Locations?" value={vacVacancy.multipleLocations} isDark={isDark}/>
                    <SumRow label="Additional Locations" value={vacVacancy.additionalLocations?.length ? `${vacVacancy.additionalLocations.length} added` : null} isDark={isDark}/>
                    <SumRow label="Prior Cancellation" value={vacVacancy.priorCancellation} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Property Condition & Risk" icon="home" isDark={isDark}>
                    <SumRow label="Protection Class" value={vacPropertyRisk.protectionClass} isDark={isDark}/>
                    <SumRow label="Wildfire Score" value={vacPropertyRisk.wildfireScore} isDark={isDark}/>
                    <SumRow label="Active Wildfire Within 50 mi" value={vacPropertyRisk.activeWildfire} isDark={isDark}/>
                    <SumRow label="Fire Hydrant Distance" value={vacPropertyRisk.fireHydrantDistance} isDark={isDark}/>
                    <SumRow label="Fire Station Distance" value={vacPropertyRisk.fireStationDistance} isDark={isDark}/>
                    <SumRow label="Jobsite Security" value={(vacPropertyRisk.security || []).join(', ')} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Underwriting Questions" icon="check" isDark={isDark}>
                    <SumRow label="Historic Designation" value={vacUnderwriting.historicDesignation} isDark={isDark}/>
                    <SumRow label="Wood Shake Roof" value={vacUnderwriting.woodShakeRoof} isDark={isDark}/>
                    <SumRow label="Landslide / Forest / Brush Fire Zone" value={vacUnderwriting.fireZone} isDark={isDark}/>
                    <SumRow label="Existing Structural Damage" value={vacUnderwriting.structuralDamage} isDark={isDark}/>
                    <SumRow label="More Than One Mortgage" value={vacUnderwriting.multipleMortgages} isDark={isDark}/>
                    <SumRow label="Scheduled Renovation" value={vacUnderwriting.scheduledRenovation} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Values & Coverage" icon="shield" isDark={isDark}>
                    <SumRow label="New Work Value" value={vacValues.newWorkValue && `$${vacValues.newWorkValue}`} isDark={isDark}/>
                    <SumRow label="Existing Structure Value" value={vacValues.existingValue && `$${vacValues.existingValue}`} isDark={isDark}/>
                    <SumRow label="Total Completed Value" value={vacValues.totalCompletedValue && `$${vacValues.totalCompletedValue}`} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Contractor" icon="briefcase" isDark={isDark}>
                    <SumRow label="Work Being Performed" value={vacContractor.workBeingPerformed} isDark={isDark}/>
                    <SumRow label="Insured is GC?" value={vacContractor.insuredIsGC} isDark={isDark}/>
                    <SumRow label="Contractor Name" value={vacContractor.name} isDark={isDark}/>
                    <SumRow label="License #" value={vacContractor.licenseNumber} isDark={isDark}/>
                    <SumRow label="Years of Experience" value={vacContractor.yearsExperience} isDark={isDark}/>
                    <SumRow label="Licensed & Compliant" value={vacContractor.compliant} isDark={isDark}/>
                    <SumRow label="Load-Bearing Modification" value={vacContractor.loadBearingMod} isDark={isDark}/>
                    <SumRow label="Architect Signoff" value={vacContractor.architectSignoff} isDark={isDark}/>
                    <SumRow label="Permits & Financing Secured" value={vacContractor.permitsSecured} isDark={isDark}/>
                    <SumRow label="Sprinkler System" value={vacContractor.sprinklerSystem} isDark={isDark}/>
                    <SumRow label="TRIA Coverage Required" value={vacContractor.triaCoverage} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Deductibles & Optional Coverages" icon="card" isDark={isDark}>
                    <SumRow label="Wind & Hail Deductible" value={vacDeductibles.windHail} isDark={isDark}/>
                    <SumRow label="All Other Perils Deductible" value={vacDeductibles.aop} isDark={isDark}/>
                    <SumRow label="Policy Form" value={vacDeductibles.policyForm} isDark={isDark}/>
                    <SumRow label="Roof Exclusion" value={vacDeductibles.roofExclusion} isDark={isDark}/>
                    <SumRow label="Cosmetic Roof Exclusion" value={vacDeductibles.cosmeticRoofExclusion} isDark={isDark}/>
                    <SumRow label="Vandalism Coverage" value={vacDeductibles.vandalism} isDark={isDark}/>
                    <SumRow label="Earthquake Coverage" value={vacDeductibles.earthquake} isDark={isDark}/>
                    <SumRow label="Water Damage Exclusion" value={vacDeductibles.waterDamageExclusion} isDark={isDark}/>
                    <SumRow label="Premises Liability" value={vacDeductibles.premisesLiability} isDark={isDark}/>
                    <SumRow label="Premises Liability Limit" value={vacDeductibles.premisesLiabilityLimit} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Property Maintenance" icon="home" isDark={isDark}>
                    <SumRow label="Inspection Frequency" value={vacMaintenance.inspectionFrequency} isDark={isDark}/>
                    <SumRow label="Utilities Operational" value={(vacMaintenance.utilities || []).join(', ')} isDark={isDark}/>
                    <SumRow label="Central Alarm" value={vacMaintenance.centralAlarm} isDark={isDark}/>
                  </SummaryBlock>

                  <SummaryBlock title="Loss History / Financial Eligibility" icon="clock" isDark={isDark}>
                    <SumRow label="3+ Losses or > $25k" value={vacLoss.multipleLosses} isDark={isDark}/>
                    <SumRow label="Open/Unresolved Claims" value={vacLoss.openClaims} isDark={isDark}/>
                    <SumRow label="Bankruptcy / Arson / Fraud" value={vacLoss.bankruptcyOrFraud} isDark={isDark}/>
                    <SumRow label="Foreclosure or Tax Liens" value={vacLoss.foreclosureTaxLiens} isDark={isDark}/>
                    <SumRow label="Property Condemned" value={vacLoss.condemned} isDark={isDark}/>
                    <SumRow label="Evictions In Progress" value={vacLoss.evictions} isDark={isDark}/>
                    <SumRow label="Underwriting Notes" value={vacLoss.notes} isDark={isDark}/>
                  </SummaryBlock>
                </>
              ) : (
              <>
              <SummaryBlock title="Contractor" icon="briefcase" isDark={isDark}>
                <SumRow label="Insured is GC?" value={contractor.insuredIsGC} isDark={isDark}/>
                <SumRow label="Contractor Name" value={contractor.name} isDark={isDark}/>
                <SumRow label="License #" value={contractor.licenseNumber} isDark={isDark}/>
                <SumRow label="Years of Experience" value={contractor.yearsExperience} isDark={isDark}/>
                <SumRow label="State Compliant" value={contractor.compliant} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Project" icon="pin" isDark={isDark}>
                <SumRow label="Effective Date" value={project.effectiveDate} isDark={isDark}/>
                <SumRow label="Duration" value={project.duration} isDark={isDark}/>
                <SumRow label="Address" value={project.projectAddress} isDark={isDark}/>
                <SumRow label="City / State / Zip" value={[project.projectCity, project.projectState, project.projectZip].filter(Boolean).join(', ')} isDark={isDark}/>
                <SumRow label="Structure Type" value={project.structureType} isDark={isDark}/>
                <SumRow label="Construction Type" value={project.constructionType} isDark={isDark}/>
                <SumRow label="Square Footage" value={project.squareFootage} isDark={isDark}/>
                <SumRow label="Stories" value={project.stories} isDark={isDark}/>
                <SumRow label="Occupancy" value={project.occupancy} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Coverage" icon="shield" isDark={isDark}>
                <SumRow label="Completed Value" value={coverage.completedValue && `$${coverage.completedValue}`} isDark={isDark}/>
                <SumRow label="Remodel Value" value={coverage.remodelValue && `$${coverage.remodelValue}`} isDark={isDark}/>
                <SumRow label="New Work Value" value={coverage.newWorkValue && `$${coverage.newWorkValue}`} isDark={isDark}/>
                <SumRow label="Existing Structure Value" value={coverage.existingValue && `$${coverage.existingValue}`} isDark={isDark}/>
                <SumRow label="Temp Storage" value={coverage.tempStorage} isDark={isDark}/>
                <SumRow label="Property in Transit" value={coverage.transit} isDark={isDark}/>
                <SumRow label="Soft Costs" value={coverage.softCosts} isDark={isDark}/>
                <SumRow label="Equipment Breakdown" value={coverage.equipmentBreakdown} isDark={isDark}/>
                <SumRow label="Premises Liability" value={coverage.premisesLiability} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Property Protection" icon="home" isDark={isDark}>
                <SumRow label="Protection Class" value={protection.protectionClass} isDark={isDark}/>
                <SumRow label="Wildfire Score" value={protection.wildfireScore} isDark={isDark}/>
                <SumRow label="Active Wildfire Within 50 mi" value={protection.activeWildfire} isDark={isDark}/>
                <SumRow label="Fire Hydrant Distance" value={protection.fireHydrantDistance} isDark={isDark}/>
                <SumRow label="Fire Station Distance" value={protection.fireStationDistance} isDark={isDark}/>
                <SumRow label="Jobsite Security" value={(protection.security || []).join(', ')} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Eligibility & Underwriting" icon="check" isDark={isDark}>
                <SumRow label="Non-residential / light commercial" value={eligibility.nonLightCommercial} isDark={isDark}/>
                <SumRow label="Unusual construction" value={eligibility.unusualConstruction} isDark={isDark}/>
                <SumRow label="Cannabis-related occupancy" value={eligibility.cannabis} isDark={isDark}/>
                <SumRow label="Multiple structures" value={eligibility.multipleStructures} isDark={isDark}/>
                <SumRow label="Prior loss repair" value={eligibility.priorLossRepair} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Loss History" icon="clock" isDark={isDark}>
                <SumRow label="Loss Category" value={lossHistory.category} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Financial" icon="card" isDark={isDark}>
                <SumRow label="Bankruptcy" value={financial.bankruptcy} isDark={isDark}/>
                <SumRow label="Policy Canceled" value={financial.policyCanceled} isDark={isDark}/>
                <SumRow label="Cancellation Explanation" value={financial.cancellationExplanation} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Existing Coverage" icon="doc" isDark={isDark}>
                <SumRow label="Replacing Existing Coverage?" value={existingCov.replacingExisting} isDark={isDark}/>
                <SumRow label="Prior Carrier" value={existingCov.priorCarrier} isDark={isDark}/>
                <SumRow label="Construction Already Begun?" value={existingCov.constructionBegun} isDark={isDark}/>
                <SumRow label="Start Date" value={existingCov.startDate} isDark={isDark}/>
                <SumRow label="% Complete" value={existingCov.percentComplete} isDark={isDark}/>
                <SumRow label="Work Completed Value" value={existingCov.completedValue && `$${existingCov.completedValue}`} isDark={isDark}/>
                <SumRow label="Remaining Value" value={existingCov.remainingValue && `$${existingCov.remainingValue}`} isDark={isDark}/>
                <SumRow label="Reason for Switching" value={existingCov.switchReason} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Project Conditions" icon="check" isDark={isDark}>
                <SumRow label="No-Loss Statement" value={projectConditions.noLossStatement} isDark={isDark}/>
                <SumRow label="Site Secured" value={projectConditions.siteSecured} isDark={isDark}/>
                <SumRow label="Applicant Owns Property" value={projectConditions.applicantOwnsProperty} isDark={isDark}/>
                <SumRow label="Permits in Place" value={projectConditions.permitsInPlace} isDark={isDark}/>
                <SumRow label="GC Carries $1M CGL" value={projectConditions.gcCarriesCGL} isDark={isDark}/>
                <SumRow label="Written Contract" value={projectConditions.writtenContract} isDark={isDark}/>
                <SumRow label="No Lapse in Prior Coverage" value={projectConditions.noLapseInPrior} isDark={isDark}/>
                <SumRow label="Project Description" value={projectConditions.notes} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Additional Interests" icon="users" isDark={isDark}>
                <SumRow label="Mortgagee" value={summarizeParty(ai.mortgagee)} isDark={isDark}/>
                <SumRow label="Loss Payee" value={summarizeParty(ai.lossPayee)} isDark={isDark}/>
                <SumRow label="Additional Insured" value={summarizeParty(ai.additionalInsured)} isDark={isDark}/>
              </SummaryBlock>

              <SummaryBlock title="Bind Confirmation" icon="card" isDark={isDark}>
                <SumRow label="Acknowledged" value={bindConf.acknowledgment === true || bindConf.acknowledgment === 'true' ? 'Yes' : bindConf.acknowledgment} isDark={isDark}/>
              </SummaryBlock>
              </>
              )}
            </div>

            {/* Footer with Print action */}
            <div
              className="shrink-0 px-6 py-4 flex items-center justify-between gap-3"
              style={{
                background: isDark ? '#191D35' : 'white',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-80"
                style={{
                  color: isDark ? '#D1D5DB' : '#374151',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E5E7EB',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={triggerPrint}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: GR, boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* Sidebar and RightPanel hidden on the bound page — post-bind is a
            standalone "receipt" view; the app-flow chrome would just be noise. */}

        <main className="flex-1 overflow-y-auto custom-scroll" style={{ background: isDark ? '#131629' : 'white' }}>
          <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10 space-y-5 md:space-y-6">

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

                {/* Quick print button — top-right of the Bind submitted card */}
                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print / Save as PDF"
                  className="no-print w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.15)' : 'rgba(92,46,212,0.06)'; e.currentTarget.style.borderColor = 'rgba(92,46,212,0.3)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'white'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <defs><linearGradient id="hdrPrintG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/><stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/></linearGradient></defs>
                    <path stroke="url(#hdrPrintG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                </button>
              </div>

              {/* QUOTE NUMBER / GENERATED / STATUS — GL-Bop pattern. Three
                  uppercase labels with bold values, vertical hairline dividers
                  between columns, sits between the title row and the Print &
                  View toggle. Visible at all times for at-a-glance status. */}
              <div
                className="grid grid-cols-3 divide-x divide-gray-100"
                style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
              >
                <div className="px-6 py-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>Policy Number</p>
                  <p className="text-sm font-bold" style={{
                    background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{submissionId}</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>Effective Date</p>
                  <p className="text-sm font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>
                    {project.effectiveDate || vacRisk.effectiveDate || new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>Status</p>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: GR }} />
                    <span className="text-sm font-bold" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {isAtrium ? 'Quote Pending' : 'Sold'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Policy bound with [Carrier] — GL-Bop's bound-policy summary row.
                  Sizes match BopSubmission exactly: 14px bold title, 12px gray
                  subtitle, 10px uppercase gray-400 right label, 20px amount. */}
              {boundCarrier && (
                <div
                  className="flex items-center gap-4 flex-wrap px-6 py-4"
                  style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                      {isAtrium ? 'Quote sent to ' : 'Policy bound with '}{boundCarrier.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Program: <span className="font-semibold capitalize">{boundCarrier.program}</span>
                      {coverageValueNum > 0 && <>{' · '}Coverage {money(coverageValueNum)}</>}
                      {' · '}Premium {money(boundCarrier.premium || 0)}
                      {' · '}Fee {money(policyFee)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {isAtrium ? 'Estimated Total' : 'Charged today'}
                    </div>
                    <div className="text-xl font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{money(total)}</div>
                  </div>
                </div>
              )}

            {/* Selected carrier card — collapsed by default, click to expand details */}
            {false && boundCarrier && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isDark ? '#1A1E38' : 'white',
                  border: `1.5px solid ${isDark ? 'rgba(166,20,195,0.55)' : '#A614C3'}`,
                  boxShadow: '0 8px 28px rgba(166,20,195,0.10)',
                }}
              >
                {/* Collapsed header — click to toggle */}
                <button
                  type="button"
                  onClick={() => setCarrierOpen(o => !o)}
                  className="w-full px-5 py-4 flex items-center justify-between transition hover:opacity-90"
                  style={{ background: 'transparent' }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: GR }} />
                    <span className="text-base font-bold truncate" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{boundCarrier.name}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>{boundCarrier.program}</span>
                    <span
                      className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded whitespace-nowrap"
                      style={{
                        background: boundCarrier.type === 'Admitted' ? 'rgba(115,201,183,0.18)' : 'rgba(252,165,165,0.18)',
                        color: boundCarrier.type === 'Admitted' ? '#0D8B73' : '#B91C1C',
                      }}
                    >
                      {boundCarrier.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-bold" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {money(total)}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: carrierOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                {/* Expanded detail panel — Policy Fee / Commission / breakdown */}
                {carrierOpen && (
                  <div className="px-5 pb-4" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-3 mb-1">Estimated Premium</p>
                    <p className="text-3xl font-bold mb-3" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {money(boundCarrier.premium || 0)}
                    </p>
                    <div className="space-y-1.5 text-[12px]">
                      <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Policy Fee</span><span className="font-medium" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{money(policyFee)}</span></div>
                      <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Commission</span><span className="font-medium" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{Math.round((boundCarrier.commission || 0) * 100 * 10) / 10}%</span></div>
                      <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Platform</span><span className="font-medium" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{boundCarrier.platformFunctionality}</span></div>
                      <div className="flex justify-between pt-2 mt-1" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}` }}>
                        <span className="font-semibold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>Total Due</span>
                        <span className="font-bold" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{money(total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full submission summary — always expanded on the bound page
                (was a collapsible toggle; on this receipt-style view it's
                redundant to hide by default). Sits INSIDE the Bind
                submitted card as a footer section, border-top hairline so
                it reads as one document. */}
            <div
              style={{
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              {true && (
                <div id="submission-print-area" className="px-5 py-5">

                  {/* Print-only document header — hidden on screen, shown when printing.
                      Matches commercial-auto pattern: logos row + single info row. */}
                  <div className="print-only flex-col mb-4">
                    {/* Branding row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 8, borderBottom: '1.5px solid #E5E7EB' }}>
                      <img src={norbielinkLogo} alt="NorbieLink" style={{ height: 22, objectFit: 'contain' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 8, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600 }}>POWERED BY</span>
                        <img src={btisLogo} alt="btis" style={{ height: 18, objectFit: 'contain' }} />
                      </div>
                    </div>
                    {/* Applicant + submission info row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{applicant.namedInsured || '—'}</p>
                        <p style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>
                          {[applicant.businessType, applicant.phone, applicant.email].filter(Boolean).join('  ·  ')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Builder's Risk Application</p>
                        <p style={{ fontSize: 8, color: '#9CA3AF', marginTop: 2 }}>#{submissionId} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {isAtrium ? 'Quote Pending' : 'Sold'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bound carrier — full detail in print overview */}
                  {boundCarrier && (
                    <div className="mb-3">
                      <SummaryBlock title="Selected Carrier" icon="card" isDark={isDark}>
                        <SumRow label="Program" value={boundCarrier.program} isDark={isDark}/>
                        <SumRow label="Carrier" value={boundCarrier.name} isDark={isDark}/>
                        <SumRow label="Type" value={boundCarrier.type} isDark={isDark}/>
                        <SumRow label="Coverage Value" value={coverageValueNum > 0 ? money(coverageValueNum) : null} isDark={isDark}/>
                        <SumRow label="Estimated Premium" value={money(boundCarrier.premium || 0)} isDark={isDark}/>
                        <SumRow label="Policy Fee" value={money(policyFee)} isDark={isDark}/>
                        <SumRow label="Commission" value={`${Math.round((boundCarrier.commission || 0) * 100 * 10) / 10}%`} isDark={isDark}/>
                        <SumRow label="Platform" value={boundCarrier.platformFunctionality} isDark={isDark}/>
                        <SumRow label="Total Due" value={money(total)} isDark={isDark}/>
                      </SummaryBlock>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SummaryBlock title="Applicant" icon="user" isDark={isDark}>
                      <SumRow label="Named Insured" value={applicant.namedInsured} isDark={isDark}/>
                      <SumRow label="DBA" value={applicant.dba} isDark={isDark}/>
                      <SumRow label="Mailing Address" value={[applicant.address, applicant.suite].filter(Boolean).join(', ')} isDark={isDark}/>
                      <SumRow label="City / State / Zip" value={[applicant.city, applicant.state, applicant.zip].filter(Boolean).join(', ')} isDark={isDark}/>
                      <SumRow label="Inspection Contact" value={applicant.inspContactName} isDark={isDark}/>
                      <SumRow label="Phone" value={applicant.phone} isDark={isDark}/>
                      <SumRow label="Email" value={applicant.email} isDark={isDark}/>
                      <SumRow label="Business Type" value={applicant.businessType} isDark={isDark}/>
                      <SumRow label="Entity Role" value={applicant.entityRole} isDark={isDark}/>
                    </SummaryBlock>

                    {isVacant ? (
                      <>
                        <SummaryBlock title="Risk Information" icon="home" isDark={isDark}>
                          <SumRow label="Effective Date" value={vacRisk.effectiveDate} isDark={isDark}/>
                          <SumRow label="Property Address" value={vacRisk.propertyAddress} isDark={isDark}/>
                          <SumRow label="City / State / Zip" value={[vacRisk.propertyCity, vacRisk.propertyState, vacRisk.propertyZip].filter(Boolean).join(', ')} isDark={isDark}/>
                          <SumRow label="Year Built" value={vacRisk.yearBuilt} isDark={isDark}/>
                          <SumRow label="Square Footage" value={vacRisk.squareFootage} isDark={isDark}/>
                          <SumRow label="Construction Type" value={vacRisk.constructionType} isDark={isDark}/>
                          <SumRow label="Occupancy" value={vacRisk.occupancy} isDark={isDark}/>
                          <SumRow label="Stories" value={vacRisk.stories} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="System Upgrades" icon="check" isDark={isDark}>
                          <SumRow label="Roof Updated" value={vacSystemUpgrades.roofUpdated} isDark={isDark}/>
                          <SumRow label="Roof Year" value={vacSystemUpgrades.roofYear} isDark={isDark}/>
                          <SumRow label="Electrical Updated" value={vacSystemUpgrades.electricalUpdated} isDark={isDark}/>
                          <SumRow label="Plumbing Updated" value={vacSystemUpgrades.plumbingUpdated} isDark={isDark}/>
                          <SumRow label="HVAC Updated" value={vacSystemUpgrades.hvacUpdated} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Vacancy Eligibility" icon="check" isDark={isDark}>
                          <SumRow label="Currently Vacant?" value={vacVacancy.currentlyVacant} isDark={isDark}/>
                          <SumRow label="Vacancy Months" value={vacVacancy.vacancyMonths} isDark={isDark}/>
                          <SumRow label="Continuously Insured" value={vacVacancy.continuouslyInsured} isDark={isDark}/>
                          <SumRow label="Secured Against Entry" value={vacVacancy.secured} isDark={isDark}/>
                          <SumRow label="Multiple Locations?" value={vacVacancy.multipleLocations} isDark={isDark}/>
                          <SumRow label="Additional Locations" value={vacVacancy.additionalLocations?.length ? `${vacVacancy.additionalLocations.length} added` : null} isDark={isDark}/>
                          <SumRow label="Prior Cancellation" value={vacVacancy.priorCancellation} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Property Condition & Risk" icon="home" isDark={isDark}>
                          <SumRow label="Protection Class" value={vacPropertyRisk.protectionClass} isDark={isDark}/>
                          <SumRow label="Wildfire Score" value={vacPropertyRisk.wildfireScore} isDark={isDark}/>
                          <SumRow label="Active Wildfire Within 50 mi" value={vacPropertyRisk.activeWildfire} isDark={isDark}/>
                          <SumRow label="Fire Hydrant Distance" value={vacPropertyRisk.fireHydrantDistance} isDark={isDark}/>
                          <SumRow label="Fire Station Distance" value={vacPropertyRisk.fireStationDistance} isDark={isDark}/>
                          <SumRow label="Jobsite Security" value={(vacPropertyRisk.security || []).join(', ')} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Underwriting Questions" icon="check" isDark={isDark}>
                          <SumRow label="Historic Designation" value={vacUnderwriting.historicDesignation} isDark={isDark}/>
                          <SumRow label="Wood Shake Roof" value={vacUnderwriting.woodShakeRoof} isDark={isDark}/>
                          <SumRow label="Landslide / Forest / Brush Fire Zone" value={vacUnderwriting.fireZone} isDark={isDark}/>
                          <SumRow label="Existing Structural Damage" value={vacUnderwriting.structuralDamage} isDark={isDark}/>
                          <SumRow label="More Than One Mortgage" value={vacUnderwriting.multipleMortgages} isDark={isDark}/>
                          <SumRow label="Scheduled Renovation" value={vacUnderwriting.scheduledRenovation} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Values & Coverage" icon="shield" isDark={isDark}>
                          <SumRow label="New Work Value" value={vacValues.newWorkValue && `$${vacValues.newWorkValue}`} isDark={isDark}/>
                          <SumRow label="Existing Structure Value" value={vacValues.existingValue && `$${vacValues.existingValue}`} isDark={isDark}/>
                          <SumRow label="Total Completed Value" value={vacValues.totalCompletedValue && `$${vacValues.totalCompletedValue}`} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Contractor" icon="briefcase" isDark={isDark}>
                          <SumRow label="Work Being Performed" value={vacContractor.workBeingPerformed} isDark={isDark}/>
                          <SumRow label="Insured is GC?" value={vacContractor.insuredIsGC} isDark={isDark}/>
                          <SumRow label="Contractor Name" value={vacContractor.name} isDark={isDark}/>
                          <SumRow label="License #" value={vacContractor.licenseNumber} isDark={isDark}/>
                          <SumRow label="Years of Experience" value={vacContractor.yearsExperience} isDark={isDark}/>
                          <SumRow label="Licensed & Compliant" value={vacContractor.compliant} isDark={isDark}/>
                          <SumRow label="Load-Bearing Modification" value={vacContractor.loadBearingMod} isDark={isDark}/>
                          <SumRow label="Architect Signoff" value={vacContractor.architectSignoff} isDark={isDark}/>
                          <SumRow label="Permits & Financing Secured" value={vacContractor.permitsSecured} isDark={isDark}/>
                          <SumRow label="Sprinkler System" value={vacContractor.sprinklerSystem} isDark={isDark}/>
                          <SumRow label="TRIA Coverage Required" value={vacContractor.triaCoverage} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Deductibles & Optional Coverages" icon="card" isDark={isDark}>
                          <SumRow label="Wind & Hail Deductible" value={vacDeductibles.windHail} isDark={isDark}/>
                          <SumRow label="All Other Perils Deductible" value={vacDeductibles.aop} isDark={isDark}/>
                          <SumRow label="Policy Form" value={vacDeductibles.policyForm} isDark={isDark}/>
                          <SumRow label="Roof Exclusion" value={vacDeductibles.roofExclusion} isDark={isDark}/>
                          <SumRow label="Cosmetic Roof Exclusion" value={vacDeductibles.cosmeticRoofExclusion} isDark={isDark}/>
                          <SumRow label="Vandalism Coverage" value={vacDeductibles.vandalism} isDark={isDark}/>
                          <SumRow label="Earthquake Coverage" value={vacDeductibles.earthquake} isDark={isDark}/>
                          <SumRow label="Water Damage Exclusion" value={vacDeductibles.waterDamageExclusion} isDark={isDark}/>
                          <SumRow label="Premises Liability" value={vacDeductibles.premisesLiability} isDark={isDark}/>
                          <SumRow label="Premises Liability Limit" value={vacDeductibles.premisesLiabilityLimit} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Property Maintenance" icon="home" isDark={isDark}>
                          <SumRow label="Inspection Frequency" value={vacMaintenance.inspectionFrequency} isDark={isDark}/>
                          <SumRow label="Utilities Operational" value={(vacMaintenance.utilities || []).join(', ')} isDark={isDark}/>
                          <SumRow label="Central Alarm" value={vacMaintenance.centralAlarm} isDark={isDark}/>
                        </SummaryBlock>

                        <SummaryBlock title="Loss History / Financial Eligibility" icon="clock" isDark={isDark}>
                          <SumRow label="3+ Losses or > $25k" value={vacLoss.multipleLosses} isDark={isDark}/>
                          <SumRow label="Open/Unresolved Claims" value={vacLoss.openClaims} isDark={isDark}/>
                          <SumRow label="Bankruptcy / Arson / Fraud" value={vacLoss.bankruptcyOrFraud} isDark={isDark}/>
                          <SumRow label="Foreclosure or Tax Liens" value={vacLoss.foreclosureTaxLiens} isDark={isDark}/>
                          <SumRow label="Property Condemned" value={vacLoss.condemned} isDark={isDark}/>
                          <SumRow label="Evictions In Progress" value={vacLoss.evictions} isDark={isDark}/>
                          <SumRow label="Underwriting Notes" value={vacLoss.notes} isDark={isDark}/>
                        </SummaryBlock>
                      </>
                    ) : (
                    <>
                    <SummaryBlock title="Contractor" icon="briefcase" isDark={isDark}>
                      <SumRow label="Insured is GC?" value={contractor.insuredIsGC} isDark={isDark}/>
                      <SumRow label="Contractor Name" value={contractor.name} isDark={isDark}/>
                      <SumRow label="License #" value={contractor.licenseNumber} isDark={isDark}/>
                      <SumRow label="Years of Experience" value={contractor.yearsExperience} isDark={isDark}/>
                      <SumRow label="State Compliant" value={contractor.compliant} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Project" icon="pin" isDark={isDark}>
                      <SumRow label="Effective Date" value={project.effectiveDate} isDark={isDark}/>
                      <SumRow label="Duration" value={project.duration} isDark={isDark}/>
                      <SumRow label="Address" value={project.projectAddress} isDark={isDark}/>
                      <SumRow label="City / State / Zip" value={[project.projectCity, project.projectState, project.projectZip].filter(Boolean).join(', ')} isDark={isDark}/>
                      <SumRow label="Structure Type" value={project.structureType} isDark={isDark}/>
                      <SumRow label="Construction Type" value={project.constructionType} isDark={isDark}/>
                      <SumRow label="Square Footage" value={project.squareFootage} isDark={isDark}/>
                      <SumRow label="Stories" value={project.stories} isDark={isDark}/>
                      <SumRow label="Occupancy" value={project.occupancy} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Coverage" icon="shield" isDark={isDark}>
                      <SumRow label="Completed Value" value={coverage.completedValue && `$${coverage.completedValue}`} isDark={isDark}/>
                      <SumRow label="Remodel Value" value={coverage.remodelValue && `$${coverage.remodelValue}`} isDark={isDark}/>
                      <SumRow label="New Work Value" value={coverage.newWorkValue && `$${coverage.newWorkValue}`} isDark={isDark}/>
                      <SumRow label="Existing Structure Value" value={coverage.existingValue && `$${coverage.existingValue}`} isDark={isDark}/>
                      <SumRow label="Temp Storage" value={coverage.tempStorage} isDark={isDark}/>
                      <SumRow label="Property in Transit" value={coverage.transit} isDark={isDark}/>
                      <SumRow label="Soft Costs" value={coverage.softCosts} isDark={isDark}/>
                      <SumRow label="Equipment Breakdown" value={coverage.equipmentBreakdown} isDark={isDark}/>
                      <SumRow label="Premises Liability" value={coverage.premisesLiability} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Property Protection" icon="home" isDark={isDark}>
                      <SumRow label="Protection Class" value={protection.protectionClass} isDark={isDark}/>
                      <SumRow label="Wildfire Score" value={protection.wildfireScore} isDark={isDark}/>
                      <SumRow label="Active Wildfire Within 50 mi" value={protection.activeWildfire} isDark={isDark}/>
                      <SumRow label="Fire Hydrant Distance" value={protection.fireHydrantDistance} isDark={isDark}/>
                      <SumRow label="Fire Station Distance" value={protection.fireStationDistance} isDark={isDark}/>
                      <SumRow label="Jobsite Security" value={(protection.security || []).join(', ')} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Eligibility & Underwriting" icon="check" isDark={isDark}>
                      <SumRow label="Non-residential / light commercial" value={eligibility.nonLightCommercial} isDark={isDark}/>
                      <SumRow label="Unusual construction" value={eligibility.unusualConstruction} isDark={isDark}/>
                      <SumRow label="Cannabis-related occupancy" value={eligibility.cannabis} isDark={isDark}/>
                      <SumRow label="Multiple structures" value={eligibility.multipleStructures} isDark={isDark}/>
                      <SumRow label="Prior loss repair" value={eligibility.priorLossRepair} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Loss History" icon="clock" isDark={isDark}>
                      <SumRow label="Loss Category" value={lossHistory.category} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Financial" icon="card" isDark={isDark}>
                      <SumRow label="Bankruptcy" value={financial.bankruptcy} isDark={isDark}/>
                      <SumRow label="Policy Canceled" value={financial.policyCanceled} isDark={isDark}/>
                      <SumRow label="Cancellation Explanation" value={financial.cancellationExplanation} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Existing Coverage" icon="doc" isDark={isDark}>
                      <SumRow label="Replacing Existing Coverage?" value={existingCov.replacingExisting} isDark={isDark}/>
                      <SumRow label="Prior Carrier" value={existingCov.priorCarrier} isDark={isDark}/>
                      <SumRow label="Construction Already Begun?" value={existingCov.constructionBegun} isDark={isDark}/>
                      <SumRow label="Start Date" value={existingCov.startDate} isDark={isDark}/>
                      <SumRow label="% Complete" value={existingCov.percentComplete} isDark={isDark}/>
                      <SumRow label="Work Completed Value" value={existingCov.completedValue && `$${existingCov.completedValue}`} isDark={isDark}/>
                      <SumRow label="Remaining Value" value={existingCov.remainingValue && `$${existingCov.remainingValue}`} isDark={isDark}/>
                      <SumRow label="Reason for Switching" value={existingCov.switchReason} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Project Conditions" icon="check" isDark={isDark}>
                      <SumRow label="No-Loss Statement" value={projectConditions.noLossStatement} isDark={isDark}/>
                      <SumRow label="Site Secured" value={projectConditions.siteSecured} isDark={isDark}/>
                      <SumRow label="Applicant Owns Property" value={projectConditions.applicantOwnsProperty} isDark={isDark}/>
                      <SumRow label="Permits in Place" value={projectConditions.permitsInPlace} isDark={isDark}/>
                      <SumRow label="GC Carries $1M CGL" value={projectConditions.gcCarriesCGL} isDark={isDark}/>
                      <SumRow label="Written Contract" value={projectConditions.writtenContract} isDark={isDark}/>
                      <SumRow label="No Lapse in Prior Coverage" value={projectConditions.noLapseInPrior} isDark={isDark}/>
                      <SumRow label="Project Description" value={projectConditions.notes} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Additional Interests" icon="users" isDark={isDark}>
                      <SumRow label="Mortgagee" value={ai.mortgagee?.hasParty === 'Yes' ? (ai.mortgagee?.name || 'Yes') : ai.mortgagee?.hasParty} isDark={isDark}/>
                      <SumRow label="Loss Payee" value={ai.lossPayee?.hasParty === 'Yes' ? (ai.lossPayee?.name || 'Yes') : ai.lossPayee?.hasParty} isDark={isDark}/>
                      <SumRow label="Additional Insured" value={ai.additionalInsured?.hasParty === 'Yes' ? (ai.additionalInsured?.name || 'Yes') : ai.additionalInsured?.hasParty} isDark={isDark}/>
                    </SummaryBlock>

                    <SummaryBlock title="Bind Confirmation" icon="card" isDark={isDark}>
                      <SumRow label="Acknowledged" value={bindConf.acknowledgment === true || bindConf.acknowledgment === 'true' ? 'Yes' : bindConf.acknowledgment} isDark={isDark}/>
                    </SummaryBlock>
                    </>
                    )}
                  </div>

                  {/* Print / Save as PDF — full-width footer button */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="no-print mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: GR, boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Print / Save as PDF
                  </button>
                </div>
              )}
            </div>
            </div>{/* end of Bind submitted card — header + Print & View are siblings inside it */}

            {/* CROSS-SELL OPPORTUNITIES — commercial-auto pattern. Builder's
                Risk policies leave gaps that GL / WC / BOP fill in for the
                contractor, so this is a natural place to offer them. */}
            <div
              className="no-print rounded-2xl px-4 md:px-10 py-6 md:py-8"
              style={{
                background: isDark ? '#1A1E38' : 'white',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="url(#csBolt)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
                    <defs>
                      <linearGradient id="csBolt" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gradient">Cross-Sell Opportunities</span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 leading-snug" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>
                  We prefill your information<br className="hidden md:block" /> to save you time.{' '}
                  <span className="text-gradient">Why wait?</span>
                </h3>
                <p className="text-xs md:text-sm text-gray-400">Client info is already saved — adding coverages takes minutes.</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'General Liability',      desc: "Protect the contractor's third-party exposure on the jobsite", price: '$450/year',   badge: 'RECOMMENDED', badgeColor: '#73C9B7', icon: iconGL },
                  { name: "Workers' Compensation",  desc: 'Required coverage for the construction crew',                  price: '$1,200/year', badge: 'TOP PICK',    badgeColor: '#A614C3', icon: iconWorker },
                  { name: 'Business Owners Policy', desc: "Bundle the contractor's property + GL coverage and save",      price: '$850/year',   badge: 'BEST VALUE',  badgeColor: '#73C9B7', icon: iconBO },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl overflow-hidden hover:shadow-sm transition"
                    style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6'}` }}
                  >
                    <div className="flex items-center gap-3 px-4 py-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: isDark ? 'rgba(92,46,212,0.15)' : 'rgba(92,46,212,0.06)' }}
                      >
                        <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <p className="text-sm font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#1F1B47' }}>{item.name}</p>
                          <span
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0"
                            style={{ background: item.badgeColor }}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-4 shrink-0 ml-2">
                        <div className="text-right">
                          <p className="text-base font-bold text-gradient leading-tight">{item.price}</p>
                          <p className="text-[10px] text-gray-400">estimated</p>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition whitespace-nowrap"
                          style={{ background: GR, boxShadow: '0 2px 8px rgba(92,46,212,0.2)' }}
                        >
                          Get Quote Now →
                        </button>
                      </div>
                    </div>
                    {/* Mobile footer */}
                    <div
                      className="md:hidden flex items-center justify-between px-4 py-3"
                      style={{
                        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
                        background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
                      }}
                    >
                      <div>
                        <p className="text-sm font-bold text-gradient leading-tight">{item.price}</p>
                        <p className="text-[10px] text-gray-400">estimated</p>
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white rounded-xl transition whitespace-nowrap"
                        style={{ background: GR }}
                      >
                        Get Quote →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

      </div>
    </div>
  )
}
