import { RadioGroup, Textarea } from '../../components/FormField'

const QUESTIONS = [
  { key: 'multipleLosses',       label: '3+ losses OR any loss > $25,000 in past 3 years?' },
  { key: 'openClaims',           label: 'Any open or unresolved claims?' },
  { key: 'bankruptcyOrFraud',    label: 'Bankruptcy / arson / insurance fraud history?' },
  { key: 'foreclosureTaxLiens',  label: 'Foreclosure or tax liens?' },
  { key: 'condemned',            label: 'Property condemned or scheduled for demolition?' },
  { key: 'evictions',            label: 'Evictions in progress or scheduled?' },
]

export default function VacLossHistory({ formData, updateFormData }) {
  const data = formData.vacLoss || {}
  const set = (key) => (val) => updateFormData('vacLoss', { [key]: val })

  return (
    <div className="w-full space-y-4">
      {QUESTIONS.map(q => (
        <RadioGroup key={q.key} label={q.label} options={['Yes', 'No']} value={data[q.key]} onChange={set(q.key)} />
      ))}

      <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
        <Textarea
          label="Underwriting notes (optional)"
          rows={3}
          value={data.notes}
          onChange={set('notes')}
          placeholder="Additional disclosures or remarks…"
        />
      </div>
    </div>
  )
}
