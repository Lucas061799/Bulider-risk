import { RadioGroup } from '../../components/FormField'
import InfoButton, { GLvsPremisesInfo } from '../../components/InfoButton'

export default function LiabilitySelection({ formData, updateFormData }) {
  const coverage = formData.coverage || {}
  const contractor = formData.contractor || {}
  const set = (key) => (val) => updateFormData('coverage', { [key]: val })

  return (
    <div className="w-full space-y-5">
      {contractor.insuredIsGC === 'Yes' ? (
        <div className="text-[12px] text-gray-500 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,246,255,0.6)', border: '1px dashed #E5E7EB' }}>
          Premises Liability not available — the Named Insured is the General Contractor (covered under their GL).
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
              Premises Liability
            </label>
            <InfoButton title="General Liability vs Premises Liability">
              <GLvsPremisesInfo />
            </InfoButton>
          </div>
          <RadioGroup
            options={['Included', 'Not Requested']}
            value={coverage.premisesLiability}
            onChange={set('premisesLiability')}
          />
        </div>
      )}
    </div>
  )
}
