import { Select, RadioGroup, Checkbox } from '../../components/FormField'

const UTILITIES = ['Electricity', 'Water', 'Gas', 'None']

export default function VacPropertyMaintenance({ formData, updateFormData }) {
  const data = formData.vacMaintenance || {}
  const set = (key) => (val) => updateFormData('vacMaintenance', { [key]: val })

  const utilities = data.utilities || []
  const toggleUtility = (opt) => {
    let next
    if (opt === 'None') next = utilities.includes('None') ? [] : ['None']
    else {
      const without = utilities.filter(u => u !== 'None')
      next = without.includes(opt) ? without.filter(u => u !== opt) : [...without, opt]
    }
    set('utilities')(next)
  }

  return (
    <div className="w-full space-y-5">
      <Select
        label="How often is the property inspected?"
        options={['Daily', 'Weekly', 'Monthly']}
        value={data.inspectionFrequency}
        onChange={set('inspectionFrequency')}
        placeholder="Select…"
        className="max-w-xs"
      />

      <div>
        <p className="text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">Which utilities are operational?</p>
        <div className="flex flex-wrap gap-3">
          {UTILITIES.map(u => (
            <Checkbox key={u} label={u} checked={utilities.includes(u)} onChange={() => toggleUtility(u)} />
          ))}
        </div>
      </div>

      <RadioGroup
        label="Is there a central station burglar alarm with active monitoring?"
        options={['Yes', 'No']}
        value={data.centralAlarm}
        onChange={set('centralAlarm')}
      />
    </div>
  )
}
