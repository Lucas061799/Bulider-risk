import { Input, FormGrid, RadioGroup } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

export default function VacVacancyEligibility({ formData, updateFormData, isDark = false }) {
  const data = formData.vacVacancy || {}
  const set = (key) => (val) => updateFormData('vacVacancy', { [key]: val })

  // Additional vacant locations — only shown when user says "More than one
  // vacant location?" is Yes. Repeats the property address structure per the
  // doc: "If Yes → repeat property address section".
  const locations = data.additionalLocations || []
  const updateLoc = (idx, patch) => {
    const next = locations.map((loc, i) => i === idx ? { ...loc, ...patch } : loc)
    set('additionalLocations')(next)
  }
  const addLoc = () => set('additionalLocations')([...locations, { address: '', city: '', state: '', zip: '' }])
  const removeLoc = (idx) => set('additionalLocations')(locations.filter((_, i) => i !== idx))

  return (
    <div className="w-full space-y-4">
      <RadioGroup label="Is the property currently vacant?" options={['Yes', 'No']} value={data.currentlyVacant} onChange={set('currentlyVacant')} />

      {data.currentlyVacant === 'Yes' && (
        <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
          <Input label="Vacancy duration (months, 1–72)" value={data.vacancyMonths} onChange={set('vacancyMonths')} />
          <RadioGroup label="Continuously insured since becoming vacant?" options={['Yes', 'No']} value={data.continuouslyInsured} onChange={set('continuouslyInsured')} />
          <RadioGroup label="Secured against unauthorized entry?" options={['Yes', 'No']} value={data.secured} onChange={set('secured')} />
          <RadioGroup label="More than one vacant location?" options={['Yes', 'No']} value={data.multipleLocations} onChange={set('multipleLocations')} />

          {data.multipleLocations === 'Yes' && (
            <div className="pt-3 space-y-4" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}` }}>
              <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                Additional Vacant Locations
              </p>
              {locations.map((loc, idx) => (
                <div key={idx} className="space-y-3 p-3 rounded-lg" style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: isDark ? '#D1D5DB' : '#6B7280' }}>Location {idx + 2}</span>
                    <button
                      type="button"
                      onClick={() => removeLoc(idx)}
                      className="text-[11px] underline"
                      style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                    >
                      Remove
                    </button>
                  </div>
                  <AddressAutocomplete
                    label="Address"
                    value={loc.address || ''}
                    onChange={(v) => updateLoc(idx, { address: v })}
                    onSelect={({ address, city, state, zip }) => updateLoc(idx, { address, city, state, zip })}
                  />
                  <FormGrid cols={3}>
                    <Input label="City" value={loc.city} onChange={(v) => updateLoc(idx, { city: v })} />
                    <Input label="State" value={loc.state} onChange={(v) => updateLoc(idx, { state: v })} placeholder="CA" />
                    <Input label="Zip" value={loc.zip} onChange={(v) => updateLoc(idx, { zip: v })} placeholder="00000" />
                  </FormGrid>
                </div>
              ))}
              <button
                type="button"
                onClick={addLoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                style={{
                  color: isDark ? '#A78BFA' : '#5C2ED4',
                  border: `1.5px dashed ${isDark ? 'rgba(167,139,250,0.4)' : 'rgba(92,46,212,0.35)'}`,
                  background: isDark ? 'transparent' : 'white',
                }}
              >
                + Add another location
              </button>
            </div>
          )}
        </div>
      )}

      <RadioGroup
        label="Prior cancellation / non-renewal in past 3 years (non-vacancy related)?"
        options={['Yes', 'No']}
        value={data.priorCancellation}
        onChange={set('priorCancellation')}
      />
    </div>
  )
}
