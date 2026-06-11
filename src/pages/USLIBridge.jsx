import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import jungleImg from '../assets/jungle.png'
import norbieCircleImg from '../assets/norbie-circle-00.png'
import bananaImg from '../assets/banana.png'
import { PROJECT_TYPE_CONFIG } from '../lib/projectTypeConfig'

// Vacant Land + Vacant Commercial fall outside our marketplace appetite —
// in Phase 1 there's no real USLI API integration. So this page mirrors the
// commercial-auto-app's "Well banana..." decline pattern: honest about the
// dead-end, push the agent back to pick a different project type, and offer
// USLI only as a secondary out-link.
export default function USLIBridge({ projectType, state, onBack }) {
  const cfg = PROJECT_TYPE_CONFIG[projectType]
  const label = cfg?.label || 'this risk'

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Two-pane body — left decline / right Norbie illustration */}
      <div className="flex flex-1">

        {/* Left — decline panel */}
        <div className="flex-1 md:w-1/2 md:flex-none overflow-y-auto relative" style={{ borderRight: '1px solid #F3F4F6' }}>
          {/* Mobile: subtle jungle bg behind form */}
          <img src={jungleImg} alt="" className="md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none" style={{ opacity: 0.06 }} />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[10%]">
            <div className="w-full max-w-xl text-center">

              {/* 4 🍌 4 */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="font-black text-[#FCDF50] select-none" style={{ fontSize: '5rem', lineHeight: 1 }}>4</span>
                <img src={bananaImg} alt="banana" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
                <span className="font-black text-[#FCDF50] select-none" style={{ fontSize: '5rem', lineHeight: 1 }}>4</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                Well banana…
              </h2>
              <p className="text-base text-gray-500 leading-relaxed mb-1">
                We don't write <span className="font-semibold">{label}</span> through this marketplace.
              </p>
              <p className="text-sm text-gray-400 mb-7 leading-relaxed">
                You can quote it directly with USLI, or pick a different project type.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={onBack}
                  className="w-full py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 20px rgba(92,46,212,0.3)' }}
                >
                  Try a different project type
                </button>

                <a
                  href={`https://www.usli.com/?source=norbielink&type=${encodeURIComponent(projectType)}&state=${encodeURIComponent(state || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold transition-all"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#5C2ED4' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
                >
                  Go to USLI →
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Right — Norbie illustration (desktop only) */}
        <div className="hidden md:flex relative overflow-hidden shrink-0 items-center justify-center" style={{ width: '50%', background: 'white' }}>
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.25 }} />
          <img src={norbieCircleImg} alt="Norbie" className="relative z-10 select-none pointer-events-none" style={{ width: '500px', height: '500px', objectFit: 'contain' }} />
        </div>

      </div>
    </div>
  )
}
