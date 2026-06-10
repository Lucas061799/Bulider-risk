import { Input, FormGrid, RadioGroup, Checkbox } from '../../components/FormField'

const SECURITY_OPTIONS = ['Fence', 'Lighting', 'Security Cameras', 'Watchman', 'Private Security Patrol', 'Other', 'None']

export default function VacPropertyConditionRisk({ formData, updateFormData }) {
  const data = formData.vacPropertyRisk || {}
  const set = (key) => (val) => updateFormData('vacPropertyRisk', { [key]: val })

  const security = data.security || []
  const toggleSecurity = (opt) => {
    const next = security.includes(opt) ? security.filter(s => s !== opt) : [...security, opt]
    set('security')(next)
  }

  return (
    <div className="w-full space-y-5">
      <div className="rounded-xl p-4" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
        <p className="text-[11px] font-bold tracking-wider uppercase mb-2.5" style={{ color: '#5C2ED4' }}>
          System-Populated (Risk Meter API)
        </p>
        <FormGrid>
          <Input label="Protection Class" value={data.protectionClass} onChange={set('protectionClass')} placeholder="API will populate" />
          <Input label="Wildfire Score" value={data.wildfireScore} onChange={set('wildfireScore')} placeholder="API will populate" />
        </FormGrid>
        <div className="mt-3">
          <RadioGroup
            label="Active wildfire within 50 miles?"
            options={['Yes', 'No']}
            value={data.activeWildfire}
            onChange={set('activeWildfire')}
          />
        </div>
      </div>

      <FormGrid>
        <Input label="Distance to Nearest Fire Hydrant" value={data.fireHydrantDistance} onChange={set('fireHydrantDistance')} placeholder="Google API" />
        <Input label="Distance to Nearest Fire Station" value={data.fireStationDistance} onChange={set('fireStationDistance')} placeholder="Google API" />
      </FormGrid>

      <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
        <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-3">Jobsite Security</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SECURITY_OPTIONS.map(opt => (
            <Checkbox key={opt} label={opt} checked={security.includes(opt)} onChange={() => toggleSecurity(opt)} />
          ))}
        </div>
      </div>
    </div>
  )
}
