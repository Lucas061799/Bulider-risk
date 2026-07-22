// Pre-quote review modal — mirrors GL-Bop's "Review Before Quoting" UX.
// Opens when user clicks Get Quotes; lets them eyeball the full application
// before it gets sent to carriers, then "Confirm & Get Quotes" continues
// the flow.
import norbielinkLogo from '../assets/norbielink-logo.png'
import norbielinkLogoDark from '../assets/norbielink-logo-dark.png'
import btisLogo from '../assets/btislogo.png'
import btisLogoDark from '../assets/btislogo-dark.png'

const GR = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// AdditionalInterests buckets are { hasParty, entries: [{name, address...}] }.
// Older submissions stored a single {name, address...} object directly under
// the bucket; fall back to that shape so legacy data still renders.
function summarizeParty(bucket) {
  if (!bucket || bucket.hasParty !== 'Yes') return bucket?.hasParty
  const entries = Array.isArray(bucket.entries) && bucket.entries.length
    ? bucket.entries
    : (bucket.name ? [{ name: bucket.name }] : [])
  if (!entries.length) return 'Yes'
  const first = entries[0].name || 'Yes'
  return entries.length > 1 ? `${first} +${entries.length - 1} more` : first
}

const BLOCK_ICON_PATHS = {
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  pin:      'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  doc:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  card:     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  check:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  users:    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  warning:  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
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
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(115,201,183,0.12)' }}>
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
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6'}` }}>
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{value}</span>
    </div>
  )
}

export default function ReviewModal({ open, onClose, onConfirm, formData = {}, isDark = false, projectType, variant = 'review' }) {
  if (!open) return null

  const isVacant = projectType === 'vacant_dwelling'

  // BR-flow buckets
  const applicant = formData.applicant || {}
  const contractor = formData.contractor || {}
  const project = formData.project || {}
  const coverage = formData.coverage || {}
  const protection = formData.propertyProtection || {}
  const eligibility = formData.eligibility || {}
  const lossHistory = formData.lossHistory || {}
  const financial = formData.financial || {}
  const existingCov = formData.existingCoverage || {}
  const projectConditions = formData.projectConditions || {}
  const ai = formData.additionalInterests || {}
  const bindConf = formData.bindConfirmation || {}

  // Vacant Dwelling buckets — separate flow with distinct schema
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
  const projectLabel = projectType
    ? projectType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : "Builder's Risk"
  const isDownload = variant === 'download'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh', background: isDark ? '#1A1E38' : '#F9FAFB' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — matches GL-Bop's PreviewModal: doc icon + inline print
            icon next to the title + gradient-stroke close X */}
        <div
          className="no-print px-5 pt-4 pb-4 shrink-0"
          style={{ background: isDark ? '#191D35' : 'white', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(88.09deg,rgba(92,46,212,0.12) 0%,rgba(166,20,195,0.12) 100%)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="brPrevHdrG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5C2ED4"/>
                    <stop offset="100%" stopColor="#A614C3"/>
                  </linearGradient>
                </defs>
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="url(#brPrevHdrG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{isDownload ? 'Application Summary' : 'Review Before Quoting'}</h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition"
                  style={{ background: isDark ? 'rgba(167,139,250,0.22)' : 'rgba(92,46,212,0.08)' }}
                  onMouseEnter={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.34)' : 'rgba(92,46,212,0.16)' }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.22)' : 'rgba(92,46,212,0.08)' }}
                  aria-label="Print or save a copy"
                  title="Print or save a copy"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path stroke="url(#brPrevHdrG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8" stroke="url(#brPrevHdrG)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                {isDownload
                  ? 'Preview the application below before downloading.'
                  : "Confirm your details below. We'll send them to our carriers."}
              </p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: isDark ? '#C084FC' : '#5C2ED4' }}>
                {isDownload
                  ? 'Tap the printer icon to save a copy.'
                  : 'Need a copy first? Tap the printer icon.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="no-print w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition"
              style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`, background: isDark ? 'transparent' : 'white' }}
              onMouseEnter={ev => { ev.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.12)' : 'rgba(92,46,212,0.06)'; ev.currentTarget.style.borderColor = 'rgba(92,46,212,0.3)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = isDark ? 'transparent' : 'white'; ev.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path stroke="url(#brPrevHdrG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div id="review-print-area" className="overflow-y-auto p-5 space-y-3">
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
                <p style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Draft Application Summary</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 8, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Category</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginTop: 2 }}>{projectLabel}</p>
              </div>
            </div>
          </div>

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
                <SumRow label="Electrical Year" value={vacSystemUpgrades.electricalYear} isDark={isDark}/>
                <SumRow label="Plumbing Updated" value={vacSystemUpgrades.plumbingUpdated} isDark={isDark}/>
                <SumRow label="Plumbing Year" value={vacSystemUpgrades.plumbingYear} isDark={isDark}/>
                <SumRow label="HVAC Updated" value={vacSystemUpgrades.hvacUpdated} isDark={isDark}/>
                <SumRow label="HVAC Year" value={vacSystemUpgrades.hvacYear} isDark={isDark}/>
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
                <SumRow label="Other Security" value={vacPropertyRisk.securityOther} isDark={isDark}/>
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
                <SumRow label="Modification Type" value={vacContractor.modificationType} isDark={isDark}/>
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
          </SummaryBlock>

          <SummaryBlock title="Property Protection" icon="home" isDark={isDark}>
            <SumRow label="Protection Class" value={protection.protectionClass} isDark={isDark}/>
            <SumRow label="Wildfire Score" value={protection.wildfireScore} isDark={isDark}/>
            <SumRow label="Active Wildfire Within 50 mi" value={protection.activeWildfire} isDark={isDark}/>
            <SumRow label="Fire Hydrant Distance" value={protection.fireHydrantDistance} isDark={isDark}/>
            <SumRow label="Fire Station Distance" value={protection.fireStationDistance} isDark={isDark}/>
            <SumRow label="Jobsite Security" value={(protection.security || []).join(', ')} isDark={isDark}/>
            <SumRow label="Other Security" value={protection.securityOther} isDark={isDark}/>
          </SummaryBlock>

          <SummaryBlock title="Eligibility & Underwriting" icon="check" isDark={isDark}>
            <SumRow label="Non-residential / light commercial" value={eligibility.nonLightCommercial} isDark={isDark}/>
            <SumRow label="Unusual construction" value={eligibility.unusualConstruction} isDark={isDark}/>
            <SumRow label="Cannabis-related occupancy" value={eligibility.cannabis} isDark={isDark}/>
            <SumRow label="Multiple structures" value={eligibility.multipleStructures} isDark={isDark}/>
            <SumRow label="# Structures" value={eligibility.numStructures} isDark={isDark}/>
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

        {/* Footer — same buttons in both variants. Print is always
            available via the header icon. */}
        <div
          className="no-print shrink-0 px-6 py-4 flex items-center justify-between gap-3"
          style={{ background: isDark ? '#191D35' : 'white', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
            style={{ color: isDark ? '#D1D5DB' : '#374151', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`, background: isDark ? 'transparent' : 'white' }}
          >
            {isDownload ? 'Close' : 'Go back to edit'}
          </button>
          <button
            type="button"
            onClick={() => { if (isDownload) { window.print() } else { onClose(); onConfirm && onConfirm() } }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: GR, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            {isDownload ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Print / Save as PDF
              </>
            ) : (
              <>
                Confirm &amp; Get Quotes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
