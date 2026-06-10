import { Checkbox } from '../../components/FormField'

export default function BindConfirmation({ formData, updateFormData, config }) {
  const data = formData.bindConfirmation || {}
  const set = (key) => (val) => updateFormData('bindConfirmation', { [key]: val })

  const attestation = config?.bindAttestation
  if (!attestation) {
    return (
      <div className="text-[13px] text-gray-500 px-4 py-3 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px dashed #E5E7EB' }}>
        No bind attestation required for this project type.
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-xl p-5" style={{ background: 'rgba(254,243,199,0.4)', border: '1px solid #FDE68A' }}>
        <p className="text-[12px] font-bold tracking-wider uppercase mb-2.5" style={{ color: '#92400E' }}>
          ⚠ {attestation.title}
        </p>
        <p className="text-[13px] leading-relaxed text-gray-700 whitespace-pre-line">
          {attestation.body}
        </p>
      </div>

      <Checkbox
        label={attestation.checkbox}
        checked={!!data.certified}
        onChange={(v) => set('certified')(v)}
      />
      {!data.certified && (
        <p className="text-[11px] text-amber-700">You must certify to bind coverage.</p>
      )}
    </div>
  )
}
