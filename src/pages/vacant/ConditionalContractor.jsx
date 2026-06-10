import { Input, FormGrid, RadioGroup, Select, Textarea } from '../../components/FormField'
import InfoButton, { HorizontalVsVerticalInfo } from '../../components/InfoButton'

const MODIFICATION_TYPES = [
  'None / Interior Only (No Structural Change)',
  'Horizontal Expansion (Footprint Extension)',
  'Vertical Expansion (Additional Stories / Height Increase)',
  'Both Horizontal & Vertical Modifications',
  'Structural Alteration (Load-Bearing Changes Without Expansion)',
  'Unknown / To Be Determined',
]

// Vacant dwellings sometimes have light contractor work in progress
// This entire section is gated by "Is work being performed by a licensed contractor?"
export default function VacConditionalContractor({ formData, updateFormData }) {
  const data = formData.vacContractor || {}
  const set = (key) => (val) => updateFormData('vacContractor', { [key]: val })

  const hasContractor = data.workBeingPerformed === 'Yes'

  return (
    <div className="w-full space-y-4">
      <RadioGroup
        label="Is work being performed by a licensed contractor?"
        options={['Yes', 'No']}
        value={data.workBeingPerformed}
        onChange={set('workBeingPerformed')}
      />

      {hasContractor && (
        <div className="space-y-5 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
          <RadioGroup label="Is Named Insured also the General Contractor?" options={['Yes', 'No']} value={data.insuredIsGC} onChange={set('insuredIsGC')} />

          {data.insuredIsGC === 'No' && (
            <>
              <FormGrid>
                <Input label="Contractor Name" value={data.name} onChange={set('name')} />
                <Input label="License Number" value={data.licenseNumber} onChange={set('licenseNumber')} />
              </FormGrid>
              <Input label="Address" value={data.address} onChange={set('address')} />
              <FormGrid cols={3}>
                <Input label="City" value={data.city} onChange={set('city')} />
                <Input label="State" value={data.contractorState} onChange={set('contractorState')} />
                <Input label="Zip" value={data.zip} onChange={set('zip')} />
              </FormGrid>
              <FormGrid>
                <Input label="Years of Experience" value={data.yearsExperience} onChange={set('yearsExperience')} />
                <RadioGroup label="Licensed & compliant?" options={['Yes', 'No']} value={data.compliant} onChange={set('compliant')} />
              </FormGrid>
            </>
          )}

          <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
            <RadioGroup
              label="Are load-bearing members of the existing structure being modified, removed, or added?"
              options={['Yes', 'No']}
              value={data.loadBearingMod}
              onChange={set('loadBearingMod')}
            />

            {data.loadBearingMod === 'Yes' && (
              <div className="mt-3 space-y-3">
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
                <RadioGroup label="Architect / engineer signoff that the structure is sound for the rehab?" options={['Yes', 'No']} value={data.architectSignoff} onChange={set('architectSignoff')} />
                <RadioGroup label="Permits and financing secured?" options={['Yes', 'No']} value={data.permitsSecured} onChange={set('permitsSecured')} />
              </div>
            )}

            <div className="mt-3">
              <Textarea
                label="Description of work"
                rows={3}
                value={data.workDescription}
                onChange={set('workDescription')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
