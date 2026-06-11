import { useState } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)'

export default function BindConfirmation({ formData, updateFormData, config, isDark = false }) {
  const data = formData.bindConfirmation || {}
  const set = (key) => (val) => updateFormData('bindConfirmation', { [key]: val })

  const attestation = config?.bindAttestation
  const [open, setOpen] = useState(false)

  if (!attestation) {
    return (
      <div className="text-[13px] text-gray-500 px-4 py-3 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px dashed #E5E7EB' }}>
        No bind attestation required for this project type.
      </div>
    )
  }

  const checked = !!data.certified
  const toggleChecked = () => set('certified')(!checked)

  return (
    <div className="w-full">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: checked
            ? (isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.06)')
            : (isDark ? 'rgba(255,255,255,0.04)' : 'white'),
          border: `1.5px solid ${checked ? (isDark ? '#A78BFA' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')}`,
          boxShadow: checked ? '0 2px 12px rgba(92,46,212,0.10)' : 'none',
        }}
      >
        <div className="flex items-stretch">
          {/* Checkbox + label */}
          <button
            type="button"
            onClick={toggleChecked}
            className="flex-1 flex items-center gap-3 px-4 py-3 transition text-left min-w-0"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition"
              style={{
                background: checked ? BRAND_GRADIENT : (isDark ? 'rgba(255,255,255,0.04)' : 'white'),
                border: checked ? 'none' : `1.5px solid ${isDark ? 'rgba(255,255,255,0.20)' : '#D1D5DB'}`,
              }}
            >
              {checked && (
                <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <div className="text-left min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>
                {checked ? 'Acknowledgment Accepted' : attestation.title}
              </div>
              <div className="text-[11px] truncate" style={{ color: '#9CA3AF' }}>
                {checked ? "You're good to bind." : 'Tap to accept, or expand to review.'}
              </div>
            </div>
          </button>

          {/* Chevron */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Hide details' : 'Show details'}
            className="px-3 flex items-center justify-center transition"
            style={{
              background: 'transparent',
              borderLeft: `1px solid ${checked ? (isDark ? 'rgba(167,139,250,0.30)' : 'rgba(124,58,237,0.18)') : (isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6')}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        {/* Expanded full legal text */}
        {open && (
          <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
            <p className="text-[12px] leading-relaxed" style={{ color: isDark ? '#D1D5DB' : '#4B5563' }}>
              {attestation.body}
            </p>
            <p className="text-[12px] leading-relaxed mt-3 italic" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              {attestation.checkbox}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
