import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import PageZero from './pages/PageZero'
import Compare from './pages/Compare'
import Submission from './pages/Submission'
import USLIBridge from './pages/USLIBridge'
import ReviewModal from './components/ReviewModal'

// BR shared sections
import ApplicantInformation from './pages/br/ApplicantInformation'
import ContractorInformation from './pages/br/ContractorInformation'
import ProjectInformation from './pages/br/ProjectInformation'
import ExistingStructure from './pages/br/ExistingStructure'
import CoverageRequested from './pages/br/CoverageRequested'
import PropertyProtection from './pages/br/PropertyProtection'
import EligibilityUnderwriting from './pages/br/EligibilityUnderwriting'
import LossHistory from './pages/br/LossHistory'
import FinancialHistory from './pages/br/FinancialHistory'
import ExistingCoverage from './pages/br/ExistingCoverage'
import ProjectConditions from './pages/br/ProjectConditions'
import AdditionalInterests from './pages/br/AdditionalInterests'
import BindConfirmation from './pages/br/BindConfirmation'

// Vacant Dwelling sections
import VacRiskInformation from './pages/vacant/RiskInformation'
import VacSystemUpgrades from './pages/vacant/SystemUpgrades'
import VacVacancyEligibility from './pages/vacant/VacancyEligibility'
import VacPropertyConditionRisk from './pages/vacant/PropertyConditionRisk'
import VacUnderwritingQuestions from './pages/vacant/UnderwritingQuestions'
import VacValuesCoverage from './pages/vacant/ValuesCoverage'
import VacConditionalContractor from './pages/vacant/ConditionalContractor'
import VacDeductiblesAndCoverage from './pages/vacant/DeductiblesAndCoverage'
import VacPropertyMaintenance from './pages/vacant/PropertyMaintenance'
import VacLossHistory from './pages/vacant/LossHistory'

import {
  SECTIONS,
  getProjectConfig,
  isBuildersRiskFlow,
  isVacantDwellingFlow,
  isUSLIBridge,
} from './lib/projectTypeConfig'

// Map every section key to a component. App.jsx is the only place that does this routing.
const SECTION_COMPONENTS = {
  // BR shared
  [SECTIONS.APPLICANT]:             ApplicantInformation,
  [SECTIONS.CONTRACTOR]:            ContractorInformation,
  [SECTIONS.PROJECT]:               ProjectInformation,
  [SECTIONS.EXISTING_STRUCTURE]:    ExistingStructure,
  [SECTIONS.COVERAGE]:              CoverageRequested,
  [SECTIONS.PROPERTY_PROTECTION]:   PropertyProtection,
  [SECTIONS.ELIGIBILITY]:           EligibilityUnderwriting,
  [SECTIONS.LOSS_HISTORY]:          LossHistory,
  [SECTIONS.FINANCIAL]:             FinancialHistory,
  [SECTIONS.EXISTING_COVERAGE]:     ExistingCoverage,
  [SECTIONS.PROJECT_CONDITIONS]:    ProjectConditions,
  [SECTIONS.ADDITIONAL_INTERESTS]:  AdditionalInterests,
  [SECTIONS.BIND_CONFIRMATION]:     BindConfirmation,

  // Vacant Dwelling
  [SECTIONS.VAC_RISK]:              VacRiskInformation,
  [SECTIONS.VAC_SYSTEM_UPGRADES]:   VacSystemUpgrades,
  [SECTIONS.VAC_VACANCY]:           VacVacancyEligibility,
  [SECTIONS.VAC_PROPERTY_RISK]:     VacPropertyConditionRisk,
  [SECTIONS.VAC_UNDERWRITING]:      VacUnderwritingQuestions,
  [SECTIONS.VAC_VALUES]:            VacValuesCoverage,
  [SECTIONS.VAC_CONTRACTOR]:        VacConditionalContractor,
  [SECTIONS.VAC_DEDUCTIBLES]:       VacDeductiblesAndCoverage,
  [SECTIONS.VAC_MAINTENANCE]:       VacPropertyMaintenance,
  [SECTIONS.VAC_LOSS]:              VacLossHistory,
}

// Section headers shown in the main content area. Sidebar uses the short
// `step.label` from projectTypeConfig; this map adds a descriptive suffix
// (Information / Questions / Requested) — matches the requirements docx
// section titles and GL-Bop's "Coverage Limits" / "Underwriting Questions"
// naming convention.
const SECTION_TITLES = {
  [SECTIONS.APPLICANT]:             'Applicant Information',
  [SECTIONS.CONTRACTOR]:            'Contractor Information',
  [SECTIONS.PROJECT]:               'Project Information',
  [SECTIONS.EXISTING_STRUCTURE]:    'Existing Structure Coverage',
  [SECTIONS.EXISTING_COVERAGE]:     'Existing Coverage / Timing',
  [SECTIONS.COVERAGE]:              'Values & Coverage Requested',
  [SECTIONS.PROPERTY_PROTECTION]:   'Property Protection Information',
  [SECTIONS.ELIGIBILITY]:           'Eligibility & Underwriting Questions',
  [SECTIONS.FINANCIAL]:             'Financial / Insurance History',
  [SECTIONS.VAC_RISK]:              'Risk Information',
  [SECTIONS.VAC_CONTRACTOR]:        'Contractor Information',
  [SECTIONS.VAC_VALUES]:            'Values & Coverage Requested',
  [SECTIONS.VAC_UNDERWRITING]:      'Underwriting Questions',
  [SECTIONS.VAC_LOSS]:              'Loss History / Financial Eligibility',
}

function App() {
  // URL param shortcuts:
  //   ?page=main → skip PageZero, default to ground_up
  //   ?type=vacant_dwelling → preselect project type
  //   ?page=submission → jump to Submission preview
  const urlParams = new URLSearchParams(window.location.search)
  const pageParam = urlParams.get('page')
  const typeParam = urlParams.get('type')

  // Persist formData to localStorage so it survives page reloads and URL
  // shortcuts like ?page=submission. Without this the user's filled-in
  // data evaporates as soon as React re-mounts.
  const [formData, setFormData] = useState(() => {
    try {
      const stored = localStorage.getItem('br-formData')
      return stored ? JSON.parse(stored) : {}
    } catch { return {} }
  })
  useEffect(() => {
    try { localStorage.setItem('br-formData', JSON.stringify(formData)) } catch {}
  }, [formData])
  const [activeStep, setActiveStep] = useState(1)
  // Flow stages: form → inCompare (Get My Quotes) → bound (Select carrier)
  const [inCompare, setInCompare] = useState(pageParam === 'compare' || pageParam === 'submission')
  const [bound, setBound] = useState(pageParam === 'submission')
  const [boundCarrier, setBoundCarrier] = useState(null)
  const [pageZeroDone, setPageZeroDone] = useState(['main', 'compare', 'submission'].includes(pageParam))
  const [projectType, setProjectType] = useState(typeParam || (pageParam ? 'ground_up' : ''))
  const [state, setState] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [errorFields, setErrorFields] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
  }, [darkMode])

  const sectionRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const isScrollingToRef = useRef(false)

  const config = useMemo(() => getProjectConfig(projectType), [projectType])
  const STEPS = config?.steps || []

  const updateFormData = (section, data) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...data } }))
    if (errorFields.length > 0) setErrorFields([])
  }

  const goToStep = useCallback((stepId) => {
    if (stepId === STEPS.length + 1) {
      setInCompare(true)
      return
    }
    const el = sectionRefs.current[stepId]
    if (!el || !scrollContainerRef.current) return
    isScrollingToRef.current = true
    setActiveStep(stepId)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { isScrollingToRef.current = false }, 800)
  }, [STEPS.length])

  const handleConfirmQuotes = useCallback(async () => {
    setInCompare(true)
    const applicant = formData.applicant || {}
    if (applicant.email) {
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: applicant.email,
            firstName: applicant.namedInsured?.split(' ')[0],
            namedInsured: applicant.namedInsured,
            submissionId: 'BR' + Math.floor(Math.random() * 9000000 + 1000000),
            effectiveDate: formData.project?.effectiveDate,
          }),
        })
      } catch (e) { console.warn('Email send failed (non-blocking):', e) }
    }
  }, [formData])

  const handleCheckErrors = useCallback(() => {
    const errors = []
    const a = formData.applicant || {}
    if (!a.namedInsured) errors.push({ section: 1, field: 'applicant-namedInsured' })
    if (!a.email) errors.push({ section: 1, field: 'applicant-email' })
    if (!a.phone) errors.push({ section: 1, field: 'applicant-phone' })

    const p = formData.project || {}
    const projectStepId = STEPS.find(s => s.key === SECTIONS.PROJECT)?.id
    if (projectStepId && !p.effectiveDate) errors.push({ section: projectStepId, field: 'project-effectiveDate' })

    setErrorFields(errors.map(e => e.field))
    if (errors.length > 0) {
      const firstSection = errors[0].section
      const el = sectionRefs.current[firstSection]
      if (el && scrollContainerRef.current) {
        isScrollingToRef.current = true
        setActiveStep(firstSection)
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => { isScrollingToRef.current = false }, 800)
      }
    }
  }, [formData, STEPS])

  const handleMainScroll = useCallback(() => {
    if (isScrollingToRef.current) return
    const container = scrollContainerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const threshold = containerRect.height * 0.35
    let current = STEPS[0]?.id || 1
    STEPS.forEach(step => {
      const el = sectionRefs.current[step.id]
      if (el) {
        const top = el.getBoundingClientRect().top - containerRect.top
        if (top <= threshold) current = step.id
      }
    })
    setActiveStep(current)
  }, [STEPS])

  // ── Routing decisions ─────────────────────────────────────────────────────
  if (!pageZeroDone) {
    return (
      <PageZero
        onStart={({ state: s, projectType: pt }) => {
          setState(s)
          setProjectType(pt)
          updateFormData('pageZero', { state: s, projectType: pt })
          updateFormData('applicant', { state: s })
          setPageZeroDone(true)
        }}
      />
    )
  }

  if (isUSLIBridge(projectType)) {
    return (
      <USLIBridge
        projectType={projectType}
        state={state}
        onBack={() => { setPageZeroDone(false); setProjectType('') }}
      />
    )
  }

  // Stage 3: bound → final "Submission Complete" page with the selected carrier
  if (bound) {
    return (
      <Submission
        formData={formData}
        projectType={projectType}
        state={state}
        boundCarrier={boundCarrier}
        onBack={() => { setBound(false); setInCompare(false); setBoundCarrier(null) }}
        isDark={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
    )
  }

  // Stage 2: inCompare → carrier comparison page; Select on a card triggers bind
  if (inCompare) {
    return (
      <Compare
        formData={formData}
        projectType={projectType}
        state={state}
        onBack={() => setInCompare(false)}
        onBind={(carrier) => { setBoundCarrier(carrier); setBound(true) }}
        onDownloadSummary={() => setSummaryOpen(true)}
        isDark={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
    )
  }

  if (!isBuildersRiskFlow(projectType) && !isVacantDwellingFlow(projectType)) {
    return <div className="p-10">Unknown project type: {projectType}</div>
  }

  const flowTitle = config?.shortLabel || "Builder's Risk"

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: darkMode ? '#131629' : 'white' }}>
      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: darkMode ? '#191D35' : 'white',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-3 md:px-5 w-auto md:w-64 2xl:md:w-72 md:shrink-0">
          <button className="md:hidden mr-3 p-1.5 rounded-lg" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} onClick={() => setMobileSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { setPageZeroDone(false); setProjectType(''); setInCompare(false); setBound(false); setBoundCarrier(null); setActiveStep(1) }}
            className="focus:outline-none"
            title="Back to start"
          >
            <img src={darkMode ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-8" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-8">
          <span className="text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={darkMode ? btisLogoDark : btisLogo} alt="btis" className="h-7" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className={`fixed md:relative inset-y-0 left-0 z-40 h-full shrink-0 transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ top: 0 }}>
          <Sidebar
            steps={STEPS}
            activeStep={activeStep}
            onStepClick={(id) => { goToStep(id); setMobileSidebarOpen(false) }}
            formData={formData}
            onCheckErrors={handleCheckErrors}
            showSubmission={inCompare}
            bound={bound}
            isDark={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            flowTitle={flowTitle}
            projectType={projectType}
          />
        </div>

        <main
          ref={scrollContainerRef}
          onScroll={handleMainScroll}
          className="flex-1 overflow-y-auto custom-scroll relative"
          style={{ background: darkMode ? '#131629' : 'white' }}
        >
          <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8">


            {STEPS.map(step => {
              const Comp = SECTION_COMPONENTS[step.key]
              if (!Comp) return null
              return (
                <section
                  key={step.id}
                  ref={el => sectionRefs.current[step.id] = el}
                  id={`section-${step.id}`}
                  className="rounded-2xl"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <SectionHeader title={SECTION_TITLES[step.key] || step.label} isDark={darkMode} />
                  <div className="px-4 md:px-10 pt-4 md:pt-5 pb-8 md:pb-10">
                    <Comp
                      formData={formData}
                      updateFormData={updateFormData}
                      errorFields={errorFields}
                      isDark={darkMode}
                      projectType={projectType}
                      config={config}
                    />
                  </div>
                </section>
              )
            })}

            <div className="px-4 md:px-10 pb-12" style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
              >
                Get Quotes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            </div>
          </div>
        </main>

        <div className="hidden lg:block">
          <RightPanel onFormReview={handleCheckErrors} onDownloadSummary={() => setSummaryOpen(true)} formData={formData} isDark={darkMode} projectType={projectType} state={state}/>
        </div>
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleConfirmQuotes}
        formData={formData}
        isDark={darkMode}
        projectType={projectType}
      />

      <ReviewModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onConfirm={handleConfirmQuotes}
        formData={formData}
        isDark={darkMode}
        projectType={projectType}
        variant="download"
      />
    </div>
  )
}

function SectionHeader({ title, isDark }) {
  return (
    <div className="px-4 md:px-10 pt-6 md:pt-8 pb-0">
      <div
        className="flex items-center justify-between pb-3 md:pb-4"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#D1D5DB'}` }}
      >
        <h2 className="text-base md:text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : undefined }}>{title}</h2>
      </div>
    </div>
  )
}

export default App
