import { Input, Select, FormGrid, RadioGroup, DateInput } from '../../components/FormField'

const DURATION_OPTIONS = ['3 Months', '6 Months', '12 Months', 'Other']
const CONSTRUCTION_TYPES = [
  'Fire Resistive',
  'Frame / Wood Frame',
  'Joisted Masonry',
  'Non-Combustible Masonry',
  'Steel / Non-Combustible',
  'Log Home',
  'Other',
]
const STORY_OPTIONS = ['1', '2', '3', '4+']
const OCCUPANCY_OPTIONS = [
  'Single Family Dwelling',
  'Multi-Family Dwelling',
  'Other (Referral Required)',
]

export default function VacRiskInformation({ formData, updateFormData }) {
  const data = formData.vacRisk || {}
  const set = (key) => (val) => updateFormData('vacRisk', { [key]: val })

  return (
    <div className="w-full space-y-5">
      <FormGrid>
        <DateInput label="Proposed Effective Date" required value={data.effectiveDate} onChange={set('effectiveDate')} />
        <Select label="Project Duration" options={DURATION_OPTIONS} value={data.duration} onChange={set('duration')} placeholder="Select…" />
      </FormGrid>

      <div className="pt-3">
        <div className="space-y-4">
          <FormGrid>
            <Select label="Construction Type" options={CONSTRUCTION_TYPES} value={data.constructionType} onChange={set('constructionType')} placeholder="Select…" />
            <Input label="Total Square Footage" value={data.squareFootage} onChange={set('squareFootage')} />
          </FormGrid>
          <FormGrid>
            <Select label="Number of Stories" options={STORY_OPTIONS} value={data.stories} onChange={set('stories')} placeholder="Select…" />
            <Select label="Anticipated Occupancy" options={OCCUPANCY_OPTIONS} value={data.occupancy} onChange={set('occupancy')} placeholder="Select…" />
          </FormGrid>

          <RadioGroup
            label="ADU / Mobile / Manufactured / Modular / Prefabricated?"
            options={['Yes', 'No']}
            value={data.adu}
            onChange={set('adu')}
          />
          {data.adu === 'Yes' && (
            <Input label="Description" value={data.aduDesc} onChange={set('aduDesc')} />
          )}

          <Input label="Year Existing Structure Built" value={data.yearBuilt} onChange={set('yearBuilt')} placeholder="e.g. 1985" />
        </div>
      </div>
    </div>
  )
}
