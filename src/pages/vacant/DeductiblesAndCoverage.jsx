import { Select, FormGrid, RadioGroup } from '../../components/FormField'
import InfoButton, { DP1vsDP3Info } from '../../components/InfoButton'

// Standard vacant-dwelling deductible options (fixed dollar amounts only).
const DEDUCTIBLE_OPTIONS = ['$1,000', '$2,500', '$5,000', '$7,500', '$10,000', '$15,000', '$25,000']
const PREMISES_LIABILITY_LIMITS = ['$25,000', '$50,000', '$100,000', '$300,000', '$500,000', '$1,000,000']

export default function VacDeductiblesAndCoverage({ formData, updateFormData, isDark = false }) {
  const data = formData.vacDeductibles || {}
  const set = (key) => (val) => updateFormData('vacDeductibles', { [key]: val })

  return (
    <div className="w-full space-y-5">
      <div className="space-y-5">
        <FormGrid>
          <Select label="Wind & Hail deductible (per occurrence)" options={DEDUCTIBLE_OPTIONS} value={data.windHail} onChange={set('windHail')} placeholder="Select…" />
          <div />
        </FormGrid>
        <FormGrid>
          <Select label="All Other Perils deductible (excluding wind peril)" options={DEDUCTIBLE_OPTIONS} value={data.aop} onChange={set('aop')} placeholder="Select…" />
          <div />
        </FormGrid>
      </div>

      <div className="pt-4" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}` }}>
        <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-3 mt-3">
          Optional Coverages
        </p>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
              Policy Form
            </label>
            <InfoButton title="DP-1 vs DP-3">
              <DP1vsDP3Info />
            </InfoButton>
          </div>
          <RadioGroup
            options={['DP-1 (Named Peril)', 'DP-3 (Open Peril)']}
            value={data.policyForm}
            onChange={set('policyForm')}
          />
        </div>

        <div className="space-y-3">
          <RadioGroup label="Roof exclusion requested?" options={['Yes', 'No']} value={data.roofExclusion} onChange={set('roofExclusion')} />
          <RadioGroup label="Cosmetic roof exclusion requested?" options={['Yes', 'No']} value={data.cosmeticRoofExclusion} onChange={set('cosmeticRoofExclusion')} />
          <RadioGroup label="Vandalism & Malicious Mischief coverage required?" options={['Yes', 'No']} value={data.vandalism} onChange={set('vandalism')} />
          <RadioGroup label="Earthquake coverage required?" options={['Yes', 'No']} value={data.earthquake} onChange={set('earthquake')} />
          <RadioGroup label="Water damage exclusion requested?" options={['Yes', 'No']} value={data.waterDamageExclusion} onChange={set('waterDamageExclusion')} />
          <div>
            <RadioGroup label="Premises liability coverage required?" options={['Yes', 'No']} value={data.premisesLiability} onChange={set('premisesLiability')} />
            {data.premisesLiability === 'Yes' && (
              <div className="mt-3">
                <FormGrid>
                  <Select
                    label="Premises Liability Limits"
                    options={PREMISES_LIABILITY_LIMITS}
                    value={data.premisesLiabilityLimit}
                    onChange={set('premisesLiabilityLimit')}
                    placeholder="Select…"
                  />
                  <div />
                </FormGrid>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
