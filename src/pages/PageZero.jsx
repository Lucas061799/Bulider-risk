import { useState, useRef, useEffect } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import jungleImg from '../assets/jungle.png'
import norbieCircleImg from '../assets/norbie-circle-00.png'
import { ALL_STATES, PROJECT_TYPES, PROJECT_TYPE_CONFIG, GAIC_APPROVED_STATES } from '../lib/projectTypeConfig'

const STATE_OPTIONS = ALL_STATES.map((abbr) => abbr)

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

// Project type cards — 6 options that drive the entire flow
const PROJECT_TYPE_CARDS = [
  { id: PROJECT_TYPES.GROUND_UP,                 title: 'New Construction',         subtitle: 'Ground-up build, no existing structure',          icon: 'construction' },
  { id: PROJECT_TYPES.REMODEL_WITHOUT_EXISTING,  title: 'Remodel (No ES)',          subtitle: 'Renovation — covers new work only',               icon: 'remodel-no' },
  { id: PROJECT_TYPES.REMODEL_WITH_EXISTING,     title: 'Remodel (With ES)',        subtitle: 'Renovation — covers new work + existing building',icon: 'remodel-with' },
  { id: PROJECT_TYPES.VACANT_DWELLING,           title: 'Vacant Dwelling',          subtitle: 'Currently vacant residential property',           icon: 'dwelling' },
  { id: PROJECT_TYPES.VACANT_LAND,               title: 'Vacant Land',              subtitle: 'Undeveloped land (bridged to USLI)',              icon: 'land', external: true },
  { id: PROJECT_TYPES.VACANT_COMMERCIAL,         title: 'Vacant Commercial',        subtitle: 'Vacant commercial building (bridged to USLI)',    icon: 'commercial', external: true },
]

function CardIcon({ icon }) {
  // Lightweight inline SVG icons keyed by the project type
  const stroke = 'url(#cardG)'
  const grad = (
    <defs>
      <linearGradient id="cardG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
      </linearGradient>
    </defs>
  )
  const paths = {
    construction: <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    'remodel-no': <path d="M3 21h18M5 21V11l5-3 5 3M14 21V8m0 0L19 5v16M9 21v-4h2v4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    'remodel-with': <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 12h6M9 8h6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    dwelling: <path d="M3 12L12 4l9 8M5 10v11h14V10M10 21v-5h4v5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    land: <path d="M2 18l5-5 4 4 7-9 4 5M2 21h20" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    commercial: <path d="M3 21V7l9-3 9 3v14M3 21h18M8 12h2m4 0h2M8 16h2m4 0h2M8 8h2m4 0h2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
  }
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      {grad}
      {paths[icon] || paths.construction}
    </svg>
  )
}

export default function PageZero({ onStart }) {
  const [state, setState] = useState('')
  const [projectType, setProjectType] = useState('')

  const canCheck = state && projectType
  const cfg = projectType ? PROJECT_TYPE_CONFIG[projectType] : null

  // GAIC programmed-states warning (BR flows only)
  const showGAICWarning = cfg && cfg.carriers?.includes('gaic') && state && !GAIC_APPROVED_STATES.includes(state)
  const willBridge = !!cfg?.bridgeToUSLI

  const handleStart = () => {
    if (!canCheck) return
    onStart({ state, projectType })
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
                  Builder's Risk Insurance
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-2 md:mb-3">
                  Three Markets.<br />
                  <span className="text-gradient">One Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Tell us about your project — we'll match it to the right carrier.
                </p>
              </div>

              {/* State dropdown */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-navy mb-2">Project State</label>
                <Dropdown
                  value={state}
                  onChange={setState}
                  options={STATE_OPTIONS}
                  placeholder="Where is the project located?"
                  searchable
                />
              </div>

              {/* Project type cards */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-navy mb-2.5">Project Type</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PROJECT_TYPE_CARDS.map((card) => {
                    const selected = card.id === projectType
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setProjectType(card.id)}
                        className="text-left rounded-xl px-3 py-3 transition-all relative"
                        style={{
                          background: selected ? 'linear-gradient(135deg, rgba(92,46,212,0.06), rgba(166,20,195,0.06))' : 'white',
                          border: selected ? '1.5px solid #A614C3' : '1.5px solid #E5E7EB',
                          boxShadow: selected ? '0 4px 16px rgba(92,46,212,0.12)' : 'none',
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5"><CardIcon icon={card.icon}/></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13px] font-bold leading-tight" style={{ color: selected ? '#5C2ED4' : '#1F1B47' }}>
                                {card.title}
                              </p>
                              {card.external && (
                                <span className="text-[8px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: 'rgba(115,201,183,0.18)', color: '#0D8B73' }}>
                                  USLI
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-gray-400 mt-0.5 leading-snug">{card.subtitle}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* GAIC programmed-states warning */}
              {showGAICWarning && !willBridge && (
                <div className="mb-4 px-3.5 py-2.5 rounded-xl text-[11px]" style={{ background: 'rgba(254,243,199,0.7)', border: '1px solid #FDE68A', color: '#92400E' }}>
                  <span className="font-bold">Heads up: </span>
                  Great American (OneShot) isn't programmed in <span className="font-semibold">{state}</span> yet. You'll still get a Navigators (B-Risk) quote.
                </div>
              )}

              {/* USLI bridge notice */}
              {willBridge && (
                <div className="mb-4 px-3.5 py-2.5 rounded-xl text-[11px]" style={{ background: 'rgba(219,234,254,0.6)', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
                  <span className="font-bold">This risk class is bridged to USLI.</span> We'll collect basic info and pass it to USLI's quote portal.
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
