import { Input, FormGrid, RadioGroup } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

function PartyBlock({ title, kind, formData, updateFormData }) {
  const data = formData.additionalInterests?.[kind] || {}
  const set = (key) => (val) => {
    const prev = formData.additionalInterests?.[kind] || {}
    updateFormData('additionalInterests', { [kind]: { ...prev, [key]: val } })
  }
  const setMany = (patch) => {
    const prev = formData.additionalInterests?.[kind] || {}
    updateFormData('additionalInterests', { [kind]: { ...prev, ...patch } })
  }
  const hasParty = data.hasParty
  const setHas = (val) => set('hasParty')(val)

  return (
    <div>
      <RadioGroup label={`Add ${title}?`} options={['Yes', 'No']} value={hasParty} onChange={setHas} />
      {hasParty === 'Yes' && (
        <div className="mt-3 space-y-3 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.4)', border: '1px solid #E5E7EB' }}>
          <Input label="Name" value={data.name} onChange={set('name')} />
          <AddressAutocomplete
            label="Address"
            value={data.address || ''}
            onChange={set('address')}
            onSelect={({ address, city, state, zip }) => setMany({ address, city, state, zip })}
          />
          <FormGrid cols={3}>
            <Input label="City" value={data.city} onChange={set('city')} />
            <Input label="State" value={data.state} onChange={set('state')} placeholder="CA" />
            <Input label="Zip" value={data.zip} onChange={set('zip')} />
          </FormGrid>
        </div>
      )}
    </div>
  )
}

export default function AdditionalInterests({ formData, updateFormData }) {
  return (
    <div className="w-full space-y-5">
      <PartyBlock title="Mortgagee" kind="mortgagee" formData={formData} updateFormData={updateFormData} />
      <PartyBlock title="Loss Payee" kind="lossPayee" formData={formData} updateFormData={updateFormData} />
      <PartyBlock title="Additional Insured" kind="additionalInsured" formData={formData} updateFormData={updateFormData} />
    </div>
  )
}
