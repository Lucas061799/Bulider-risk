import { Input, RadioGroup } from '../../components/FormField'

export default function VacVacancyEligibility({ formData, updateFormData }) {
  const data = formData.vacVacancy || {}
  const set = (key) => (val) => updateFormData('vacVacancy', { [key]: val })

  return (
    <div className="w-full space-y-4">
      <RadioGroup label="Is the property currently vacant?" options={['Yes', 'No']} value={data.currentlyVacant} onChange={set('currentlyVacant')} />

      {data.currentlyVacant === 'Yes' && (
        <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
          <Input label="Vacancy duration (months, 1–72)" value={data.vacancyMonths} onChange={set('vacancyMonths')} />
          <RadioGroup label="Continuously insured since becoming vacant?" options={['Yes', 'No']} value={data.continuouslyInsured} onChange={set('continuouslyInsured')} />
          <RadioGroup label="Secured against unauthorized entry?" options={['Yes', 'No']} value={data.secured} onChange={set('secured')} />
          <RadioGroup label="More than one vacant location?" options={['Yes', 'No']} value={data.multipleLocations} onChange={set('multipleLocations')} />
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
