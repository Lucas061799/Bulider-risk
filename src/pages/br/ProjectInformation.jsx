import { Input, Select, FormGrid, RadioGroup, DateInput, Textarea } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'

const DURATION_OPTIONS = ['3 Months', '6 Months', '12 Months', 'Other']
const STRUCTURE_TYPES = ['Residential', 'Commercial']
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
  'Office',
  'Retail',
  'School',
  'Restaurant',
  'Hotel',
  'Storage Facility',
  'Other (requires referral)',
]

export default function ProjectInformation({ formData, updateFormData, errorFields = [] }) {
  const data = formData.project || {}
  const set = (key) => (val) => updateFormData('project', { [key]: val })
  const hasError = (field) => errorFields.includes(`project-${field}`)

  const handleAddressSelect = ({ address, city, state, zip }) => {
    updateFormData('project', { projectAddress: address, projectCity: city, projectState: state, projectZip: zip })
  }

  return (
    <div className="w-full space-y-5">
      <FormGrid>
        <DateInput label="Proposed Effective Date" required value={data.effectiveDate} onChange={set('effectiveDate')} error={hasError('effectiveDate')} />
        <Select label="Project Duration" required options={DURATION_OPTIONS} value={data.duration} onChange={set('duration')} placeholder="Select…" />
      </FormGrid>

      {data.duration === 'Other' && (
        <Input label="Specify duration" value={data.durationOther} onChange={set('durationOther')} className="max-w-xs" />
      )}

      <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
        <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-3">Project Location</p>
        <AddressAutocomplete
          label="Street Address"
          required
          value={data.projectAddress || ''}
          onChange={set('projectAddress')}
          onSelect={handleAddressSelect}
        />
        <div className="mt-4">
          <FormGrid cols={3}>
            <Input label="City" value={data.projectCity} onChange={set('projectCity')} />
            <Input label="State" value={data.projectState} onChange={set('projectState')} placeholder="CA" />
            <Input label="Zip" value={data.projectZip} onChange={set('projectZip')} placeholder="00000" />
          </FormGrid>
          <div className="mt-4">
            <Input label="County" value={data.projectCounty} onChange={set('projectCounty')} className="max-w-xs" />
          </div>
        </div>
      </div>

      <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
        <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-3">Project Details</p>
        <div className="space-y-5">
          <FormGrid>
            <Select label="Structure Type" required options={STRUCTURE_TYPES} value={data.structureType} onChange={set('structureType')} placeholder="Select…" />
            <Select label="Construction Type" required options={CONSTRUCTION_TYPES} value={data.constructionType} onChange={set('constructionType')} placeholder="Select…" />
          </FormGrid>

          {data.constructionType === 'Other' && (
            <Input label="Specify construction type" value={data.constructionOther} onChange={set('constructionOther')} className="max-w-md" />
          )}

          <FormGrid cols={3}>
            <Input label="Total Square Footage" value={data.squareFootage} onChange={set('squareFootage')} />
            <Select label="Stories" options={STORY_OPTIONS} value={data.stories} onChange={set('stories')} placeholder="Select…" />
            <Select label="Anticipated Occupancy" options={OCCUPANCY_OPTIONS} value={data.occupancy} onChange={set('occupancy')} placeholder="Select…" />
          </FormGrid>

          <RadioGroup
            label="Is this an ADU, Mobile, Manufactured, Modular, or Prefabricated Structure?"
            options={['Yes', 'No']}
            value={data.specialStructure}
            onChange={set('specialStructure')}
          />
          {data.specialStructure === 'Yes' && (
            <Input label="Describe" value={data.specialStructureDesc} onChange={set('specialStructureDesc')} />
          )}
        </div>
      </div>

      <div className="pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
        <Textarea
          label="Project Description (minimum 10 words)"
          required
          rows={4}
          value={data.description}
          onChange={set('description')}
          placeholder="What is being built, any unique characteristics of the project, description of work remaining and completed in detail…"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          {(data.description || '').trim().split(/\s+/).filter(Boolean).length} words
        </p>
      </div>
    </div>
  )
}
