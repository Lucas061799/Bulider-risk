import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'
import InfoButton, { HorizontalVsVerticalInfo } from '../../components/InfoButton'

// Shows ONLY when projectType === 'remodel_with_existing'
const MODIFICATION_TYPES = [
  'None / Interior Only (No Structural Change)',
  'Horizontal Expansion (Footprint Extension)',
  'Vertical Expansion (Additional Stories / Height Increase)',
  'Both Horizontal & Vertical Modifications',
  'Structural Alteration (Load-Bearing Changes Without Expansion)',
  'Unknown / To Be Determined',
]

export default function ExistingStructure({ formData, updateFormData }) {
  const data = formData.existingStructure || {}
  const set = (key) => (val) => updateFormData('existingStructure', { [key]: val })

  const loadBearingMod = data.loadBearingMod === 'Yes'

  return (
    <div className="w-full space-y-5">
      <FormGrid>
        <Input label="Year Existing Structure Was Built" value={data.yearBuilt} onChange={set('yearBuilt')} placeholder="e.g. 1985" />
        <RadioGroup
          label="Will the structure be occupied during remodel/renovation?"
          options={['Yes', 'No']}
          value={data.occupiedDuring}
          onChange={set('occupiedDuring')}
        />
      </FormGrid>

      <div className="pt-3">
        <RadioGroup
          label="Are load-bearing members of the existing structure being modified, removed, or added?"
          options={['Yes', 'No']}
          value={data.loadBearingMod}
          onChange={set('loadBearingMod')}
        />
      </div>

      {loadBearingMod && (
        <div className="pt-3 space-y-4 rounded-xl p-4" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
          <div className="flex items-start gap-2">
            <Select
              label="Renovation Modification Type"
              options={MODIFICATION_TYPES}
              value={data.modificationType}
              onChange={set('modificationType')}
              placeholder="Select…"
              className="flex-1"
            />
            <div className="mt-7">
              <InfoButton title="Horizontal vs Vertical Renovation">
                <HorizontalVsVerticalInfo />
              </InfoButton>
            </div>
          </div>

          <RadioGroup
            label="Has an architect or engineer signed off that the structure is sound for the rehab?"
            options={['Yes', 'No']}
            value={data.architectSignoff}
            onChange={set('architectSignoff')}
          />
          <RadioGroup
            label="Have permits and financing been secured?"
            options={['Yes', 'No']}
            value={data.permitsSecured}
            onChange={set('permitsSecured')}
          />
        </div>
      )}

      <div className="pt-3">
        <FormGrid cols={2}>
          <Input label="Roofing" value={data.roofingYear} onChange={set('roofingYear')} placeholder="YYYY" />
          <Input label="Heating" value={data.heatingYear} onChange={set('heatingYear')} placeholder="YYYY" />
          <Input label="Electrical" value={data.electricalYear} onChange={set('electricalYear')} placeholder="YYYY" />
          <Input label="Plumbing" value={data.plumbingYear} onChange={set('plumbingYear')} placeholder="YYYY" />
        </FormGrid>
      </div>
    </div>
  )
}
