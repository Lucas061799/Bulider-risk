import { Input, FormGrid, RadioGroup, Select, Textarea } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'
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

  const handleAddressSelect = ({ address, city, state, zip }) => {
    updateFormData('vacContractor', { address, city, contractorState: state, zip })
  }

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
              <AddressAutocomplete
                label="Address"
                value={data.address || ''}
                onChange={set('address')}
                onSelect={handleAddressSelect}
              />
              <FormGrid cols={3}>
                <Input label="City" value={data.city} onChange={set('city')} />
                <Input label="State" value={data.contractorState} onChange={set('contractorState')} />
                <Input label="Zip" value={data.zip} onChange={set('zip')} />
              </FormGrid>
              <FormGrid>
                <Input label="Years of Experience" value={data.yearsExperience} onChange={set('yearsExperience')} />
                <div />
              </FormGrid>
              <RadioGroup label="Licensed and compliant with state/local requirements?" options={['Yes', 'No']} value={data.compliant} onChange={set('compliant')} />
            </>
          )}

          <div className="pt-3">
            <RadioGroup
              label="Are load-bearing members of the existing structure being modified, removed, or added?"
              options={['Yes', 'No']}
              value={data.loadBearingMod}
              onChange={set('loadBearingMod')}
            />

            {data.loadBearingMod === 'Yes' && (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
                      Renovation Modification Type <span className="font-normal text-gray-400">(Structural Direction)</span>
                    </label>
                    <InfoButton title="Horizontal vs Vertical Renovation">
                      <HorizontalVsVerticalInfo />
                    </InfoButton>
                  </div>
                  <Select
                    options={MODIFICATION_TYPES}
                    value={data.modificationType}
                    onChange={set('modificationType')}
                    placeholder="Select…"
                  />
                </div>
                <RadioGroup label="Has an architect or engineer reviewed and signed off that the structure is sound for the rehab and temporary bracing is adequate to support the load?" options={['Yes', 'No']} value={data.architectSignoff} onChange={set('architectSignoff')} />
                <RadioGroup label="Have permits and financing been secured?" options={['Yes', 'No']} value={data.permitsSecured} onChange={set('permitsSecured')} />
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

            <div className="mt-3 space-y-3">
              <RadioGroup label="Sprinkler system present?" options={['Yes', 'No']} value={data.sprinklerSystem} onChange={set('sprinklerSystem')} />
              <RadioGroup label="TRIA coverage required?" options={['Yes', 'No']} value={data.triaCoverage} onChange={set('triaCoverage')} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
