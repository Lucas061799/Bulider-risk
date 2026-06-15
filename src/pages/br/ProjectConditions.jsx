import { useState } from 'react'
import { Textarea } from '../../components/FormField'
import norbieface from '../../assets/norbieface.png'

const CONDITIONS = [
  { key: 'noLossStatement', label: 'Can the insured provide a no-loss statement?' },
  { key: 'siteSecured', label: 'Site will remain secured throughout policy term?' },
  { key: 'applicantOwnsProperty', label: 'Applicant owns the property?' },
  { key: 'permitsInPlace', label: 'Permits in place?' },
  { key: 'gcCarriesCGL', label: 'GC carries $1M CGL minimum?' },
  { key: 'writtenContract', label: 'Written contract in place?' },
  { key: 'noLapseInPrior', label: 'No lapse in prior insurance coverage?' },
]

// All 7 are "ideally Yes" — Norbie just pre-fills Yes for the lot
const QUICK_FILL_DEFAULTS = Object.fromEntries(CONDITIONS.map(c => [c.key, 'Yes']))

const YES_NO_STYLES = {
  Yes: { activeBorder: '#5C2ED4', activeText: '#5C2ED4', activeBg: 'rgba(92,46,212,0.08)', dotBg: 'linear-gradient(88.09deg, #5C2ED4 0%, #7C3AED 100%)', dotBorder: '#5C2ED4' },
  No:  { activeBorder: '#A614C3', activeText: '#A614C3', activeBg: 'rgba(166,20,195,0.08)', dotBg: 'linear-gradient(88.09deg, #A614C3 0%, #D946EF 100%)', dotBorder: '#A614C3' },
}

function ColoredYesNo({ value, onChange, isDark = false, autoFilled = false }) {
  return (
    <div className="flex gap-4">
      {['Yes', 'No'].map(opt => {
        const s = YES_NO_STYLES[opt]
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange && onChange(opt)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
            style={active
              ? { borderColor: s.activeBorder, color: isDark ? '#FFFFFF' : s.activeText, background: isDark ? 'rgba(255,255,255,0.08)' : s.activeBg }
              : {
                  borderColor: isDark ? 'rgba(255,255,255,0.22)' : '#E5E7EB',
                  color: isDark ? '#FFFFFF' : '#6b7280',
                  background: autoFilled && !isDark ? '#F9FAFB' : 'transparent',
                }
            }
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: active ? s.dotBorder : isDark ? 'rgba(255,255,255,0.3)' : '#d1d5db' }}>
              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dotBg }} />}
            </div>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function CollapsibleGroup({ title, subtitle, children, defaultOpen = false, isDark = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
        style={{ background: isDark ? 'rgba(92,46,212,0.12)' : '#F9FAFB', border: `1px solid ${isDark ? 'rgba(92,46,212,0.25)' : '#E5E7EB'}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: isDark ? '#A78BFA' : '#5C2ED4' }}>{title}</span>
          <span className="text-[10px] font-medium" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>{subtitle}</span>
        </div>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{ color: isDark ? '#A78BFA' : '#5C2ED4', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="pt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

function QuestionCard({ q, value, onChange, autoFilled, isDark = false }) {
  return (
    <div
      className="rounded-xl p-4 border transition-all"
      style={autoFilled
        ? { borderColor: isDark ? 'rgba(92,46,212,0.2)' : '#E5E7EB', background: isDark ? 'rgba(92,46,212,0.12)' : '#F9FAFB' }
        : { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', background: isDark ? '#1F2543' : '#f9fafb' }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold leading-relaxed flex-1" style={{ color: isDark ? '#F9FAFB' : '#1f2937' }}>{q.label}</p>
        {autoFilled && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5" style={{ background: isDark ? 'rgba(166,20,195,0.35)' : 'rgba(243,240,255,1)', color: isDark ? '#F0ABFC' : '#5C2ED4' }}>Auto-Filled</span>
        )}
      </div>
      <div className="mt-3">
        <ColoredYesNo value={value} onChange={onChange} isDark={isDark} autoFilled={autoFilled} />
      </div>
    </div>
  )
}

export default function ProjectConditions({ formData, updateFormData, isDark = false }) {
  const data = formData.projectConditions || {}
  // quickFilled is local UI state — once the user clicks Quick-fill, we
  // show the "applied / reset" banner instead of the pre-fill offer.
  const [quickFilled, setQuickFilled] = useState(false)

  const handleQuickFill = () => {
    updateFormData('projectConditions', QUICK_FILL_DEFAULTS)
    setQuickFilled(true)
  }

  const handleReset = () => {
    updateFormData('projectConditions', Object.fromEntries(CONDITIONS.map(c => [c.key, undefined])))
    setQuickFilled(false)
  }

  const set = (key) => (val) => updateFormData('projectConditions', { [key]: val })

  return (
    <div className="w-full space-y-4">
      {/* Norbie Quick-Fill Banner */}
      {!quickFilled && (
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: isDark ? 'rgba(92,46,212,0.12)' : 'linear-gradient(135deg, #F8F6FF 0%, #F2FAF8 100%)',
            border: isDark ? '1px solid rgba(92,46,212,0.25)' : '1px solid rgba(124,58,237,0.12)',
          }}
        >
          {/* Desktop: single row */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug" style={{ color: isDark ? '#F9FAFB' : '#1B0750' }}>
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Apply <span className="font-semibold" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              onClick={handleQuickFill}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 shrink-0"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>

          {/* Mobile: stacked */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug" style={{ color: isDark ? '#F9FAFB' : '#1B0750' }}>
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Apply recommended answers instantly
                </p>
              </div>
            </div>
            <button
              onClick={handleQuickFill}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>
        </div>
      )}

      {/* After quick-fill: collapsed group user can expand to review */}
      {quickFilled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium" style={{ color: isDark ? '#C084FC' : '#5C2ED4' }}>
              Standard answers applied — expand to review or adjust.
            </p>
            <button onClick={handleReset} className="text-[10px] underline shrink-0" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Reset all</button>
          </div>
          <CollapsibleGroup
            title="Standard project answers"
            subtitle={`(${CONDITIONS.length} questions)`}
            isDark={isDark}
          >
            {CONDITIONS.map(c => (
              <QuestionCard
                key={c.key}
                q={c}
                value={data[c.key]}
                onChange={set(c.key)}
                autoFilled={data[c.key] === QUICK_FILL_DEFAULTS[c.key]}
                isDark={isDark}
              />
            ))}
          </CollapsibleGroup>
        </div>
      ) : (
        /* Before quick-fill: questions visible flat so user sees what's asked */
        <div className="space-y-2">
          {CONDITIONS.map(c => (
            <QuestionCard
              key={c.key}
              q={c}
              value={data[c.key]}
              onChange={set(c.key)}
              autoFilled={false}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      <div className="pt-3">
        <Textarea
          label="Additional project notes (optional)"
          rows={3}
          value={data.notes}
          onChange={set('notes')}
          placeholder="Anything else underwriting should know…"
        />
      </div>
    </div>
  )
}
