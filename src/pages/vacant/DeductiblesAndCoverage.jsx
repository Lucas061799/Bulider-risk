import { Select, FormGrid, RadioGroup } from '../../components/FormField'
import InfoButton, { DP1vsDP3Info } from '../../components/InfoButton'

const WIND_HAIL_OPTIONS = ['$1,000', '$2,500', '$5,000', '1% of Coverage A', '2% of Coverage A', '5% of Coverage A']
const AOP_OPTIONS = ['$1,000', '$2,500', '$5,000', '$10,000']

export default function VacDeductiblesAndCoverage({ formData, updateFormData }) {
  const data = formData.vacDeductibles || {}
  const set = (key) => (val) => updateFormData('vacDeductibles', { [key]: val })

  return (
    <div className="w-full space-y-5">
      <div>
        <FormGrid>
          <Select label="Wind & Hail (per occurrence)" options={WIND_HAIL_OPTIONS} value={data.windHail} onChange={set('windHail')} placeholder="Select…" />
          <Select label="All Other Perils" options={AOP_OPTIONS} value={data.aop} onChange={set('aop')} placeholder="Select…" />
        </FormGrid>
      </div>

      <div className="pt-3">

        <div className="flex items-start gap-2 mb-4">
          <div className="flex-1">
            <RadioGroup
              label="Policy Form"
              options={['DP-1 (Named Peril)', 'DP-3 (Open Peril)']}
              value={data.policyForm}
              onChange={set('policyForm')}
            />
          </div>
          <div className="mt-7">
            <InfoButton title="DP-1 vs DP-3">
              <DP1vsDP3Info />
            </InfoButton>
          </div>
        </div>

        <div className="space-y-3">
          <RadioGroup label="Roof exclusion requested?" options={['Yes', 'No']} value={data.roofExclusion} onChange={set('roofExclusion')} />
          <RadioGroup label="Cosmetic roof exclusion requested?" options={['Yes', 'No']} value={data.cosmeticRoofExclusion} onChange={set('cosmeticRoofExclusion')} />
          <RadioGroup label="Vandalism & Malicious Mischief coverage required?" options={['Yes', 'No']} value={data.vandalism} onChange={set('vandalism')} />
          <RadioGroup label="Earthquake coverage required?" options={['Yes', 'No']} value={data.earthquake} onChange={set('earthquake')} />
          <RadioGroup label="Water damage exclusion requested?" options={['Yes', 'No']} value={data.waterDamageExclusion} onChange={set('waterDamageExclusion')} />
          <RadioGroup label="Premises liability coverage required?" options={['Yes', 'No']} value={data.premisesLiability} onChange={set('premisesLiability')} />
          <RadioGroup label="Sprinkler system present?" options={['Yes', 'No']} value={data.sprinkler} onChange={set('sprinkler')} />
          <RadioGroup label="TRIA coverage required?" options={['Yes', 'No']} value={data.tria} onChange={set('tria')} />
        </div>
      </div>
    </div>
  )
}
