import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

const BUSINESS_TYPES = [
  'Sole Proprietor / Individual',
  'Partnership',
  'Corporation',
  'Limited Partnership',
  'LLC',
  'Joint Venture',
]

const ENTITY_ROLES = ['Contractor', 'Owner', 'Developer']

export default function ApplicantInformation({ formData, updateFormData, errorFields = [] }) {
  const data = formData.applicant || {}
  const set = (key) => (val) => updateFormData('applicant', { [key]: val })
  const hasError = (field) => errorFields.includes(`applicant-${field}`)

  const handleAddressSelect = ({ address, city, state, zip }) => {
    updateFormData('applicant', { address, city, state, zip })
  }

  return (
    <div className="w-full">
      <div className="space-y-5">
        <FormGrid>
          <Input label="Named Insured" required value={data.namedInsured} onChange={set('namedInsured')} error={hasError('namedInsured')} />
          <Input label="DBA (if applicable)" value={data.dba} onChange={set('dba')} placeholder="Doing Business As" />
        </FormGrid>

        <FormGrid>
          <AddressAutocomplete
            label="Mailing Address"
            value={data.address || ''}
            onChange={set('address')}
            onSelect={handleAddressSelect}
          />
          <Input label="Suite/Apt/Unit" value={data.suite} onChange={set('suite')} />
        </FormGrid>

        <FormGrid cols={3}>
          <Input label="City" value={data.city} onChange={set('city')} />
          <Input label="State" value={data.state} onChange={set('state')} placeholder="CA" />
          <Input label="Zip" value={data.zip} onChange={set('zip')} placeholder="00000" />
        </FormGrid>

        <div className="pt-3 mt-2">
          <FormGrid cols={3}>
            <Input label="Contact Name" value={data.inspContactName} onChange={set('inspContactName')} />
            <Input label="Phone" required type="tel" value={data.phone} onChange={set('phone')} placeholder="(555) 000-0000" error={hasError('phone')} />
            <Input label="Email" required type="email" value={data.email} onChange={set('email')} error={hasError('email')} />
          </FormGrid>
        </div>

        <div className="pt-3 mt-2">
          <FormGrid>
            <Select label="Business Type" required options={BUSINESS_TYPES} value={data.businessType} onChange={set('businessType')} placeholder="Select…" />
            <Select label="Entity Role" required options={ENTITY_ROLES} value={data.entityRole} onChange={set('entityRole')} placeholder="Select…" />
          </FormGrid>
        </div>
      </div>
    </div>
  )
}
