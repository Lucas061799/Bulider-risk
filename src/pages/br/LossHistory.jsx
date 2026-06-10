import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'

const LOSS_OPTIONS = [
  'No losses',
  'One loss under $10,000',
  'One loss over $10,000',
  'Loss ratio > 40%',
  'Multiple losses (2–3+)',
]

export default function LossHistory({ formData, updateFormData }) {
  const data = formData.lossHistory || {}
  const set = (key) => (val) => updateFormData('lossHistory', { [key]: val })

  return (
    <div className="w-full space-y-4">
      <p className="text-[12px] text-gray-500">Select the option that best describes the applicant's loss history.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {LOSS_OPTIONS.map(opt => {
          const selected = data.category === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => set('category')(opt)}
              className="text-left rounded-xl px-4 py-3 transition-all"
              style={{
                background: selected ? 'linear-gradient(135deg, rgba(92,46,212,0.06), rgba(166,20,195,0.06))' : 'white',
                border: selected ? '1.5px solid #A614C3' : '1.5px solid #E5E7EB',
              }}
            >
              <span className="text-[13px] font-semibold" style={{ color: selected ? '#5C2ED4' : '#1F1B47' }}>{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
