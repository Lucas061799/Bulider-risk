import { useState, useRef, useEffect } from 'react'
import { HardHat, Paintbrush, Hammer, Home, Trees, Building2 } from 'lucide-react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import jungleImg from '../assets/jungle.png'
import norbieCircleImg from '../assets/norbie-circle-00.png'
import { PROJECT_TYPES, PROJECT_TYPE_CONFIG } from '../lib/projectTypeConfig'

// Searchable dropdown (kept from commercial-auto's pattern)
function Dropdown({ value, onChange, options, placeholder, searchable = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = searchable
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-base text-left"
        style={{
          background: 'white',
          borderColor: open ? '#A614C3' : '#E5E7EB',
          boxShadow: open ? '0 0 0 3px rgba(166,20,195,0.12)' : 'none',
          color: value ? '#111827' : '#9CA3AF',
        }}
      >
        <span className="truncate pr-2">{value || placeholder}</span>
        <svg
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: open ? '#A614C3' : '#9CA3AF' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl overflow-hidden bg-white"
          style={{ border: '1px solid #E5E7EB' }}
        >
          {searchable && (
            <div className="px-3 py-2 border-b border-gray-100">
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full text-sm px-2 py-1.5 rounded-md focus:outline-none"
              />
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            {filtered.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">No results</p>
              : filtered.map(opt => {
                  const selected = opt === value
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between gap-2"
                      style={{
                        background: selected ? 'linear-gradient(88.09deg, rgba(92,46,212,0.07) 0%, rgba(166,20,195,0.07) 100%)' : 'transparent',
                        color: selected ? '#A614C3' : '#374151',
                        fontWeight: selected ? 600 : 400,
                      }}
                    >
                      <span>{opt}</span>
                      {selected && (
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" stroke="#A614C3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  )
                })
            }
          </div>
        </div>
      )}
    </div>
  )
}

// Project type rows grouped by underwriting flow. The first group goes through
// the full BR marketplace (GAIC/Navigators/Atrium). The Vacant Land + Vacant
// Commercial options bridge straight to USLI; Vacant Dwelling is its own
// Atrium flow but visually lives with the other Vacant options.
const PROJECT_TYPE_GROUPS = [
  {
    label: 'Construction & Renovation',
    hint: 'Builder’s Risk marketplace',
    items: [
      { id: PROJECT_TYPES.GROUND_UP,                title: 'New Construction',   subtitle: 'Ground-up build, no existing structure',  icon: 'construction' },
      { id: PROJECT_TYPES.REMODEL_WITHOUT_EXISTING, title: 'Remodel (No ES)',    subtitle: 'No Existing Structure Coverage',    icon: 'remodel-no' },
      { id: PROJECT_TYPES.REMODEL_WITH_EXISTING,    title: 'Remodel (With ES)',  subtitle: 'With Existing Structure Coverage',  icon: 'remodel-with' },
    ],
  },
  {
    label: 'Vacant Property',
    hint: 'Atrium + USLI partners',
    items: [
      { id: PROJECT_TYPES.VACANT_DWELLING,   title: 'Vacant Dwelling',  subtitle: 'Currently vacant residential property', icon: 'dwelling' },
      { id: PROJECT_TYPES.VACANT_LAND,       title: 'Vacant Land',      subtitle: 'Undeveloped land',                      icon: 'land',       external: true },
      { id: PROJECT_TYPES.VACANT_COMMERCIAL, title: 'Vacant Commercial',subtitle: 'Vacant commercial building',            icon: 'commercial', external: true },
    ],
  },
]

// Icons from lucide-react — same family as shadcn/ui, Tailwind UI, etc.
// Wrapper adds the soft-purple rounded-square chip behind each.
const ICON_MAP = {
  construction:    HardHat,    // Ground-up new build
  'remodel-no':    Paintbrush, // Renovation, no existing structure
  'remodel-with':  Hammer,     // Renovation incl. existing structure
  dwelling:        Home,       // Vacant residential dwelling
  land:            Trees,          // Undeveloped land
  commercial:      Building2,  // Vacant commercial building
}

// Maps a project type to a short carrier-route hint shown on the card footer.
function getCarrierHint(id) {
  switch (id) {
    case PROJECT_TYPES.GROUND_UP:
    case PROJECT_TYPES.REMODEL_WITHOUT_EXISTING:
    case PROJECT_TYPES.REMODEL_WITH_EXISTING:
      return 'GAIC · Navigators'
    case PROJECT_TYPES.VACANT_DWELLING:
      return 'Atrium (Lloyd’s)'
    case PROJECT_TYPES.VACANT_LAND:
    case PROJECT_TYPES.VACANT_COMMERCIAL:
      return 'Bridged to USLI'
    default:
      return ''
  }
}

function CardIcon({ icon, selected = false }) {
  const Lucide = ICON_MAP[icon] || HardHat
  return (
    <span
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
      style={{
        background: selected
          ? 'linear-gradient(135deg, #5C2ED4 0%, #A614C3 100%)'
          : 'linear-gradient(135deg, rgba(92,46,212,0.10), rgba(166,20,195,0.07))',
        boxShadow: selected ? '0 4px 12px rgba(92,46,212,0.25)' : 'none',
      }}
    >
      <Lucide size={20} strokeWidth={1.8} color={selected ? '#FFFFFF' : '#5C2ED4'}/>
    </span>
  )
}

// Remodel types where we surface an inline coverage notice — picking the
// wrong one has real coverage implications, so we double-check inline.
const REMODEL_CONFIRM_TYPES = [PROJECT_TYPES.REMODEL_WITHOUT_EXISTING, PROJECT_TYPES.REMODEL_WITH_EXISTING]

export default function PageZero({ onStart }) {
  const [projectType, setProjectType] = useState('')

  const canCheck = !!projectType
  const cfg = projectType ? PROJECT_TYPE_CONFIG[projectType] : null

  const willBridge = !!cfg?.bridgeToUSLI
  const showRemodelNotice = REMODEL_CONFIRM_TYPES.includes(projectType)

  const handleStart = () => {
    if (!canCheck) return
    onStart({ state: '', projectType })
  }

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left — selection panel */}
        <div className="flex-1 md:w-1/2 md:flex-none overflow-y-auto relative" style={{ borderRight: '1px solid #F3F4F6' }}>
          <img src={jungleImg} alt="" className="md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none" style={{ opacity: 0.06 }}/>

          <div className="relative z-10 min-h-full flex flex-col justify-center py-10 px-6 md:px-[8%]">
            <div className="w-full max-w-xl mx-auto">

              {/* Title */}
              <div className="mb-7 md:mb-9">
                <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-gradient mb-2 md:mb-3">
                  Builder's Risk Marketplace
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-2 md:mb-3">
                  Get Multiple Quotes.<br />
                  <span className="text-gradient">One Easy Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Tell us about your business — we'll match it to the right carrier.
                </p>
              </div>

              {/* Project type — compact horizontal cards */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-navy mb-2.5">Business Type</label>
                <div className="grid grid-cols-2 grid-rows-3 grid-flow-col gap-2">
                  {PROJECT_TYPE_GROUPS.flatMap(g => g.items).map((card) => {
                    const selected = card.id === projectType
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setProjectType(card.id)}
                        className="text-left rounded-xl transition-all relative px-3 py-2.5"
                        style={{
                          background: selected
                            ? 'linear-gradient(135deg, rgba(92,46,212,0.05) 0%, rgba(166,20,195,0.03) 100%)'
                            : 'white',
                          boxShadow: selected
                            ? '0 0 0 1.5px #A614C3, 0 4px 14px rgba(92,46,212,0.12)'
                            : '0 0 0 1px #EAECEF',
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) e.currentTarget.style.boxShadow = '0 0 0 1px #C9BFE0, 0 3px 10px rgba(92,46,212,0.06)'
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) e.currentTarget.style.boxShadow = '0 0 0 1px #EAECEF'
                        }}
                      >
                        {/* Top-right selected check */}
                        {selected && (
                          <span
                            className="absolute top-2 right-2 w-[15px] h-[15px] rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', boxShadow: '0 1.5px 6px rgba(92,46,212,0.3)' }}
                          >
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}

                        <div className="flex items-center gap-2.5">
                          <CardIcon icon={card.icon} selected={selected} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <p className="text-[12.5px] font-bold leading-tight" style={{ color: selected ? '#5C2ED4' : '#1F1B47' }}>
                                {card.title}
                              </p>
                              {card.external && (
                                <span
                                  className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                  style={{ background: 'rgba(115,201,183,0.18)', color: '#0D8B73', letterSpacing: '0.04em' }}
                                >
                                  USLI
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] leading-snug mt-0.5" style={{ color: '#9CA3AF' }}>
                              {card.subtitle}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* USLI bridge notice */}
              {willBridge && (
                <div className="mb-4 px-3.5 py-2.5 rounded-xl text-[11px]" style={{ background: 'linear-gradient(135deg, rgba(92,46,212,0.06), rgba(166,20,195,0.06))', border: '1px solid rgba(166,20,195,0.25)', color: '#5C2ED4' }}>
                  <span className="font-bold">This risk class is bridged to USLI.</span> We'll collect basic info and pass it to USLI's quote portal.
                </div>
              )}

              {/* Remodel inline confirmation — double-check coverage choice */}
              {showRemodelNotice && (
                <div className="mb-4 rounded-xl px-4 py-3" style={{ background: 'linear-gradient(135deg, rgba(92,46,212,0.04), rgba(166,20,195,0.03))', border: '1px solid rgba(92,46,212,0.18)' }}>
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24">
                      <defs><linearGradient id="remodelNoticeG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/></linearGradient></defs>
                      <circle cx="12" cy="12" r="9" stroke="url(#remodelNoticeG)" strokeWidth="1.6"/>
                      <path d="M12 8v5" stroke="url(#remodelNoticeG)" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="16.5" r="0.9" fill="url(#remodelNoticeG)"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#5C2ED4' }}>Double-check coverage</p>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                        {projectType === PROJECT_TYPES.REMODEL_WITH_EXISTING
                          ? 'Both the new construction work AND the existing building are insured under this policy.'
                          : 'Only the new construction or renovation work is insured. The existing building itself is NOT covered.'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                        {projectType === PROJECT_TYPES.REMODEL_WITH_EXISTING
                          ? 'Need only the new work covered? Pick "Remodel (No ES)" above.'
                          : 'Need the pre-existing structure covered too? Pick "Remodel (With ES)" above.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleStart}
                disabled={!canCheck}
                className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all"
                style={canCheck
                  ? { background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 20px rgba(92,46,212,0.3)' }
                  : { background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }
                }
              >
                {willBridge ? 'Continue to USLI Bridge' : 'Start Application'}
              </button>
            </div>
          </div>
        </div>

        {/* Right — illustration panel */}
        <div className="hidden md:flex relative overflow-hidden shrink-0 items-center justify-center" style={{ width: '50%', background: 'white' }}>
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.25 }} />
          <img
            src={norbieCircleImg}
            alt="Norbie"
            className="relative z-10 select-none pointer-events-none"
            style={{ width: '500px', height: '500px', objectFit: 'contain' }}
          />
        </div>
      </div>

    </div>
  )
}
