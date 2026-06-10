import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import { PROJECT_TYPE_CONFIG } from '../lib/projectTypeConfig'

// USLI Bridge — for Vacant Land / Vacant Commercial.
// Phase 1: simple external redirect explainer.
// Phase 2: collect basic contact info, push to USLI Atrium API or hand-off via secure form.
export default function USLIBridge({ projectType, state, onBack }) {
  const cfg = PROJECT_TYPE_CONFIG[projectType]
  const label = cfg?.label || 'Vacant Risk'

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(115,201,183,0.18), rgba(92,46,212,0.06))' }}>
            <svg className="w-8 h-8" fill="none" stroke="#0D8B73" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h15"/>
            </svg>
          </div>

          <p className="text-xs font-bold tracking-widest uppercase text-gradient mb-2">USLI Marketplace Bridge</p>
          <h1 className="text-3xl font-bold text-navy mb-3">Let's get you to the right market</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            <span className="font-semibold">{label}</span> risks{state && <> in <span className="font-semibold">{state}</span></>} are best served through <span className="font-semibold">USLI</span>. We'll hand you off with the basics already filled in.
          </p>

          <div className="rounded-2xl p-4 mb-6 text-left" style={{ background: 'rgba(248,246,255,0.6)', border: '1px solid #E5E7EB' }}>
            <p className="text-[11px] font-bold tracking-wide text-gray-400 uppercase mb-2">What happens next</p>
            <ul className="space-y-1.5 text-[13px] text-gray-700">
              <li className="flex gap-2"><span className="text-[#5C2ED4] font-bold">1.</span> You'll be sent to USLI's quote portal in a new tab.</li>
              <li className="flex gap-2"><span className="text-[#5C2ED4] font-bold">2.</span> Your project type and state will pre-populate.</li>
              <li className="flex gap-2"><span className="text-[#5C2ED4] font-bold">3.</span> Bind or save your quote on USLI's side — we'll sync the bind back.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={`https://www.usli.com/?source=norbielink&type=${encodeURIComponent(projectType)}&state=${encodeURIComponent(state || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all text-center"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 20px rgba(92,46,212,0.3)' }}
            >
              Continue to USLI →
            </a>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'white', border: '1px solid #E5E7EB', color: '#6B7280' }}
            >
              ← Choose a different project type
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
