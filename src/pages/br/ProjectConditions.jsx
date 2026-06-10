import { RadioGroup, Textarea } from '../../components/FormField'

const CONDITIONS = [
  { key: 'noLossStatement', label: 'Can the insured provide a no-loss statement?' },
  { key: 'siteSecured', label: 'Site will remain secured throughout policy term?' },
  { key: 'applicantOwnsProperty', label: 'Applicant owns the property?' },
  { key: 'permitsInPlace', label: 'Permits in place?' },
  { key: 'gcCarriesCGL', label: 'GC carries $1M CGL minimum?' },
  { key: 'writtenContract', label: 'Written contract in place?' },
  { key: 'noLapseInPrior', label: 'No lapse in prior insurance coverage?' },
]

export default function ProjectConditions({ formData, updateFormData }) {
  const data = formData.projectConditions || {}
  const set = (key) => (val) => updateFormData('projectConditions', { [key]: val })

  return (
    <div className="w-full space-y-4">
      <div className="space-y-4">
        {CONDITIONS.map(c => (
          <RadioGroup
            key={c.key}
            label={c.label}
            options={['Yes', 'No']}
            value={data[c.key]}
            onChange={set(c.key)}
          />
        ))}
      </div>

      <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
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
