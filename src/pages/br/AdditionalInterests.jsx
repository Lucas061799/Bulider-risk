import { Input, FormGrid, RadioGroup } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

const defaultEntry = () => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  name: '', address: '', city: '', state: '', zip: '',
})

// Backwards-compat: older submissions stored a single object (name/address/...)
// directly under the kind. If we find that shape, lift it into entries[0].
function normalizeEntries(bucket) {
  if (!bucket) return []
  if (Array.isArray(bucket.entries)) return bucket.entries
  if (bucket.name || bucket.address || bucket.city) {
    return [{ id: 'legacy', name: bucket.name || '', address: bucket.address || '', city: bucket.city || '', state: bucket.state || '', zip: bucket.zip || '' }]
  }
  return []
}

function PartyBlock({ title, kind, formData, updateFormData }) {
  const bucket = formData.additionalInterests?.[kind] || {}
  const hasParty = bucket.hasParty
  const entries = normalizeEntries(bucket)

  const writeBucket = (patch) => {
    const prev = formData.additionalInterests?.[kind] || {}
    updateFormData('additionalInterests', { [kind]: { ...prev, ...patch } })
  }

  const setHas = (val) => {
    if (val === 'Yes') {
      writeBucket({ hasParty: 'Yes', entries: entries.length ? entries : [defaultEntry()] })
    } else {
      writeBucket({ hasParty: val, entries: [] })
    }
  }

  const setEntries = (next) => writeBucket({ entries: next })
  const updateEntry = (idx, key) => (val) => setEntries(entries.map((e, i) => i === idx ? { ...e, [key]: val } : e))
  const handleAddressSelect = (idx) => ({ address, city, state, zip }) =>
    setEntries(entries.map((e, i) => i === idx ? { ...e, address, city, state, zip } : e))
  const removeEntry = (idx) => setEntries(entries.filter((_, i) => i !== idx))
  const addEntry = () => setEntries([...entries, defaultEntry()])

  return (
    <div>
      <RadioGroup label={`Add ${title}?`} options={['Yes', 'No']} value={hasParty} onChange={setHas} />

      {hasParty === 'Yes' && entries.map((entry, idx) => (
        <div key={entry.id} className="mt-3 space-y-3 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.4)', border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#5C2ED4' }}>{title} #{idx + 1}</p>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(idx)}
                className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition"
              >
                Remove
              </button>
            )}
          </div>
          <Input label="Name" value={entry.name} onChange={updateEntry(idx, 'name')} />
          <AddressAutocomplete
            label="Address"
            value={entry.address || ''}
            onChange={updateEntry(idx, 'address')}
            onSelect={handleAddressSelect(idx)}
          />
          <FormGrid cols={3}>
            <Input label="City" value={entry.city} onChange={updateEntry(idx, 'city')} />
            <Input label="State" value={entry.state} onChange={updateEntry(idx, 'state')} placeholder="CA" />
            <Input label="Zip" value={entry.zip} onChange={updateEntry(idx, 'zip')} />
          </FormGrid>
        </div>
      ))}

      {hasParty === 'Yes' && (
        <button
          type="button"
          onClick={addEntry}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed transition hover:bg-gray-50"
          style={{ borderColor: 'rgba(166,20,195,0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <defs><linearGradient id={`addMoreG-${kind}`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/></linearGradient></defs>
            <path d="M12 4v16m8-8H4" stroke={`url(#addMoreG-${kind})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[12px] font-bold" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Add another {title}
          </span>
        </button>
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
