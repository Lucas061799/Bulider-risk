import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'

function YesNoWithReferral({ label, value, onValueChange, describeValue, onDescribeChange }) {
  return (
    <div>
      <RadioGroup label={label} options={['Yes', 'No']} value={value} onChange={onValueChange} />
      {value === 'Yes' && (
        <div className="mt-2">
          <Input
            label="Describe (will be referred to underwriting)"
            value={describeValue}
            onChange={onDescribeChange}
          />
        </div>
      )}
    </div>
  )
}

export default function EligibilityUnderwriting({ formData, updateFormData }) {
  const data = formData.eligibility || {}
  const set = (key) => (val) => updateFormData('eligibility', { [key]: val })

  return (
    <div className="w-full space-y-5">
      <YesNoWithReferral
        label="Does the project involve anything other than residential or light commercial construction?"
        value={data.nonLightCommercial}
        onValueChange={set('nonLightCommercial')}
        describeValue={data.nonLightCommercialDesc}
        onDescribeChange={set('nonLightCommercialDesc')}
      />

      <YesNoWithReferral
        label="Does the project involve unusual construction (bridges, tunnels, civil works)?"
        value={data.unusualConstruction}
        onValueChange={set('unusualConstruction')}
        describeValue={data.unusualConstructionDesc}
        onDescribeChange={set('unusualConstructionDesc')}
      />

      <YesNoWithReferral
        label="Cannabis-related occupancy?"
        value={data.cannabis}
        onValueChange={set('cannabis')}
        describeValue={data.cannabisDesc}
        onDescribeChange={set('cannabisDesc')}
      />

      <div>
        <RadioGroup
          label="Multiple structures on this project?"
          options={['Yes', 'No']}
          value={data.multipleStructures}
          onChange={set('multipleStructures')}
        />
        {data.multipleStructures === 'Yes' && (
          <div className="mt-3 space-y-4 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
            <FormGrid>
              <Input label="How many structures? (1–20)" value={data.numStructures} onChange={set('numStructures')} />
              <Input label="Value per structure" value={data.valuePerStructure} onChange={set('valuePerStructure')} placeholder="$" />
            </FormGrid>
            <FormGrid>
              <Input label="Square footage per structure" value={data.sqftPerStructure} onChange={set('sqftPerStructure')} />
              <Input label="Distance between structures" value={data.distanceBetween} onChange={set('distanceBetween')} />
            </FormGrid>
          </div>
        )}
      </div>

      <YesNoWithReferral
        label="Repair due to prior loss (fire, flood, vandalism)?"
        value={data.priorLossRepair}
        onValueChange={set('priorLossRepair')}
        describeValue={data.priorLossRepairDesc}
        onDescribeChange={set('priorLossRepairDesc')}
      />
    </div>
  )
}
