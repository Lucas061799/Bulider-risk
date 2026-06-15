// Pre-quote review modal — mirrors GL-Bop's "Review Before Quoting" UX.
// Opens when user clicks Get Quotes; lets them eyeball the full application
// before it gets sent to carriers, then "Confirm & Get Quotes" continues
// the flow.
const GR = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const BLOCK_ICON_PATHS = {
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  pin:      'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
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

  const applicant = formData.applicant || {}
  const contractor = formData.contractor || {}
  const project = formData.project || {}
  const coverage = formData.coverage || {}
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
        <div className="overflow-y-auto p-5 space-y-3">
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
            <SumRow label="Temp Storage" value={coverage.tempStorage} isDark={isDark}/>
            <SumRow label="Property in Transit" value={coverage.transit} isDark={isDark}/>
            <SumRow label="Soft Costs" value={coverage.softCosts} isDark={isDark}/>
            <SumRow label="Equipment Breakdown" value={coverage.equipmentBreakdown} isDark={isDark}/>
            <SumRow label="Premises Liability" value={coverage.premisesLiability} isDark={isDark}/>
          </SummaryBlock>
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
            className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
            style={{ color: isDark ? '#D1D5DB' : '#374151', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`, background: isDark ? 'transparent' : 'white' }}
          >
            Go back to edit
          </button>
          <button
            type="button"
            onClick={() => { onClose(); onConfirm && onConfirm() }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: GR, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            Confirm &amp; Get Quotes
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
