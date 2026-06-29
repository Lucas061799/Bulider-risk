import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

// Some states (TX, CO etc.) don't require GC licensing — show the alt fields instead.
const NO_LICENSE_STATES = ['TX', 'CO']

export default function ContractorInformation({ formData, updateFormData, isDark }) {
  const data = formData.contractor || {}
  const applicant = formData.applicant || {}
  const set = (key) => (val) => updateFormData('contractor', { [key]: val })

  const handleAddressSelect = ({ address, city, state, zip }) => {
    updateFormData('contractor', { address, city, contractorState: state, zip })
  }

  const insuredIsGC = data.insuredIsGC
  // Treat either the contractor's state or the applicant's state as the
  // trigger — whichever the user fills first opens up the Exception State
  // block.
  const contractorAbbr = (data.contractorState || '').trim().toUpperCase()
  const applicantAbbr = (applicant.state || '').trim().toUpperCase()
  const stateAbbr = NO_LICENSE_STATES.includes(contractorAbbr) ? contractorAbbr : applicantAbbr
  const isExceptionState = NO_LICENSE_STATES.includes(stateAbbr)

  return (
    <div className="w-full space-y-5">
      <RadioGroup
        label="Is the Named Insured also the General Contractor?"
        required
        options={['Yes', 'No']}
        value={insuredIsGC}
        onChange={set('insuredIsGC')}
      />

      <div className="pt-2 mt-2 space-y-5">
        <FormGrid>
          <Input label="Contractor Name" required value={data.name} onChange={set('name')} />
          <Input label="License Number" required value={data.licenseNumber} onChange={set('licenseNumber')} />
        </FormGrid>

        <AddressAutocomplete
          label="Address"
          value={data.address || ''}
          onChange={set('address')}
          onSelect={handleAddressSelect}
        />
        <FormGrid cols={3}>
          <Input label="City" value={data.city} onChange={set('city')} />
          <Input label="State" value={data.contractorState} onChange={set('contractorState')} placeholder="CA" />
          <Input label="Zip" value={data.zip} onChange={set('zip')} placeholder="00000" />
        </FormGrid>

        <FormGrid>
          <Input label="Years of Experience" value={data.yearsExperience} onChange={set('yearsExperience')} />
          <div />
        </FormGrid>

        <RadioGroup
          label="Licensed and compliant with state/local requirements?"
          options={['Yes', 'No']}
          value={data.compliant}
          onChange={set('compliant')}
        />

        <RadioGroup
          label="Min. 2 years experience?"
          options={['Yes', 'No']}
          value={data.minTwoYears}
          onChange={set('minTwoYears')}
        />
      </div>

      {isExceptionState && (
        <div className="pt-3 mt-3 space-y-5 rounded-xl p-4" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
          <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#5C2ED4' }}>
            Exception State: {stateAbbr} — GC license not required
          </p>
          <FormGrid>
            <Input label="Acting Contractor Name" value={data.actingContractor} onChange={set('actingContractor')} />
            <Input label="Years of Experience" value={data.actingYearsExperience} onChange={set('actingYearsExperience')} />
          </FormGrid>
          <RadioGroup
            label="In GC trade/industry?"
            options={['Yes', 'No']}
            value={data.inGCTrade}
            onChange={set('inGCTrade')}
          />
        </div>
      )}
    </div>
  )
}
