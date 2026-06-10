import { FormGrid } from '../../components/FormField'

function MoneyInput({ label, value, onChange, hint, required }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9,.]/g, ''))}
          placeholder="0"
          className="w-full border rounded-lg pl-7 pr-3.5 py-2.5 text-sm border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40"
        />
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// Only used when there's renovation in progress (vacUnderwriting.scheduledRenovation === Yes)
// or when the user has indicated a value to be insured.
export default function VacValuesCoverage({ formData, updateFormData }) {
  const data = formData.vacValues || {}
  const set = (key) => (val) => updateFormData('vacValues', { [key]: val })

  const newWork = Number((data.newWorkValue || '').replace(/[^0-9.]/g, '')) || 0
  const existing = Number((data.existingValue || '').replace(/[^0-9.]/g, '')) || 0
  const total = newWork + existing

  return (
    <div className="w-full space-y-4">
      <p className="text-[12px] text-gray-500">Provide values being insured. If no renovation is planned, only Existing Structure Value is required.</p>
      <FormGrid>
        <MoneyInput label="New Work Value (Renovation Scope)" value={data.newWorkValue} onChange={set('newWorkValue')} hint="$0 if not applicable" />
        <MoneyInput label="Existing Structure Value" required value={data.existingValue} onChange={set('existingValue')} />
      </FormGrid>
      <MoneyInput label="Total Completed Value" value={total.toLocaleString()} onChange={() => {}} hint="Auto-calculated" />
    </div>
  )
}
