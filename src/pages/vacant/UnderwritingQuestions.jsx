import { RadioGroup } from '../../components/FormField'

const QUESTIONS = [
  { key: 'historicDesignation', label: 'Is the property historically designated or on the National Register of Historic Places?' },
  { key: 'woodShakeRoof',       label: 'Any wood shake roofing present?' },
  { key: 'fireZone',             label: 'Located in landslide, forest fire, or brush fire area (less than 200 ft clearance)?' },
  { key: 'structuralDamage',     label: 'Any existing structural damage?' },
  { key: 'multipleMortgages',    label: 'More than one mortgage or non-institutional lender involved?' },
  { key: 'scheduledRenovation',  label: 'Is the property currently undergoing or scheduled for renovation/construction?' },
]

export default function VacUnderwritingQuestions({ formData, updateFormData }) {
  const data = formData.vacUnderwriting || {}
  const set = (key) => (val) => updateFormData('vacUnderwriting', { [key]: val })

  return (
    <div className="w-full space-y-4">
      {QUESTIONS.map(q => (
        <RadioGroup key={q.key} label={q.label} options={['Yes', 'No']} value={data[q.key]} onChange={set(q.key)} />
      ))}

      {data.scheduledRenovation === 'Yes' && (
        <div className="rounded-xl p-4 mt-2" style={{ background: 'rgba(254,243,199,0.5)', border: '1px solid #FDE68A' }}>
          <p className="text-[12px] leading-relaxed" style={{ color: '#92400E' }}>
            ⚠ A scheduled renovation may make this risk better suited for the <span className="font-bold">Builder's Risk</span> program.
            Consider switching project type — we'll carry over the answers you've already provided.
          </p>
        </div>
      )}
    </div>
  )
}
