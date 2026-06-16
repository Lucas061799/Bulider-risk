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
        <div
          className="rounded-xl p-4 mt-2"
          style={{
            background: 'linear-gradient(135deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)',
            border: '1px solid rgba(92,46,212,0.2)',
          }}
        >
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#5C2ED4" strokeWidth="1.6"/>
              <path d="M12 8v5" stroke="#5C2ED4" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="0.9" fill="#5C2ED4"/>
            </svg>
            <p className="text-[12px] leading-relaxed" style={{ color: '#5C2ED4' }}>
              A scheduled renovation may make this risk better suited for the <span className="font-bold">Builder's Risk</span> program.
              Consider switching project type — we'll carry over the answers you've already provided.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
