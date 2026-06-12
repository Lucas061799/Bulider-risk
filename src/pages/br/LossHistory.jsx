const LOSS_OPTIONS = [
  'No losses',
  'One loss under $10,000',
  'One loss over $10,000',
  'Loss ratio > 40%',
  'Multiple losses (2–3+)',
]

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)'

export default function LossHistory({ formData, updateFormData }) {
  const data = formData.lossHistory || {}
  const set = (key) => (val) => updateFormData('lossHistory', { [key]: val })

  return (
    <div className="w-full space-y-3">
      <p className="text-[12px] text-gray-500 mb-2">
        Select the option that best describes the applicant's loss history.
      </p>
      <div className="space-y-1.5" role="radiogroup">
        {LOSS_OPTIONS.map(opt => {
          const selected = data.category === opt
          return (
            <label
              key={opt}
              role="radio"
              aria-checked={selected}
              tabIndex={0}
              onClick={() => set('category')(opt)}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set('category')(opt) } }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
              style={{
                background: selected ? 'linear-gradient(90deg, rgba(92,46,212,0.06), rgba(166,20,195,0.04))' : 'transparent',
                // 1.5px ring via box-shadow so layout doesn't shift on select
                boxShadow: selected ? '0 0 0 1.5px #A614C3' : '0 0 0 1px transparent',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.boxShadow = '0 0 0 1px #E5E7EB'
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.boxShadow = '0 0 0 1px transparent'
                }
              }}
            >
              {/* Radio dot */}
              <span
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: selected ? '#A614C3' : '#D1D5DB' }}
              >
                {selected && (
                  <span className="w-2 h-2 rounded-full" style={{ background: BRAND_GRADIENT }} />
                )}
              </span>
              <span
                className="text-[13px]"
                style={{
                  color: selected ? '#5C2ED4' : '#374151',
                  fontWeight: selected ? 600 : 400,
                }}
              >
                {opt}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
