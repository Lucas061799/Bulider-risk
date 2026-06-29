import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'
import InfoButton, { HorizontalVsVerticalInfo, GLvsPremisesInfo } from '../../components/InfoButton'

// Shows ONLY when projectType === 'remodel_with_existing'
const MODIFICATION_TYPES = [
  'None / Interior Only (No Structural Change)',
  'Horizontal Expansion (Footprint Extension)',
  'Vertical Expansion (Additional Stories / Height Increase)',
  'Both Horizontal & Vertical Modifications',
  'Structural Alteration (Load-Bearing Changes Without Expansion)',
  'Unknown / To Be Determined',
]
const LIMIT_OPTIONS = ['$10,000 Included', '$25,000', '$100,000', '10% of Completed Value', '25% of Completed Value']
const SOFT_COST_OPTIONS = ['Not Requested', '$50,000 Included', '10% of Completed Value', '25% of Completed Value']

export default function ExistingStructure({ formData, updateFormData, isDark = false }) {
  const data = formData.existingStructure || {}
  const coverage = formData.coverage || {}
  const contractor = formData.contractor || {}
  const set = (key) => (val) => updateFormData('existingStructure', { [key]: val })
  const setCov = (key) => (val) => updateFormData('coverage', { [key]: val })

  const loadBearingMod = data.loadBearingMod === 'Yes'

  return (
    <div className="w-full space-y-5">
      <Input
        label="Year Existing Structure Was Built"
        value={data.yearBuilt}
        onChange={set('yearBuilt')}
        placeholder="e.g. 1985"
        className="max-w-xs"
      />
      <RadioGroup
        label="Will the structure be occupied during remodel/renovation?"
        options={['Yes', 'No']}
        value={data.occupiedDuring}
        onChange={set('occupiedDuring')}
      />

      <div className="pt-3">
        <RadioGroup
          label="Are load-bearing members of the existing structure being modified, removed, or added?"
          options={['Yes', 'No']}
          value={data.loadBearingMod}
          onChange={set('loadBearingMod')}
        />
      </div>

      {loadBearingMod && (
        <div className="pt-3 space-y-4 rounded-xl p-4" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
                Renovation Modification Type <span className="font-normal text-gray-400">(Structural Direction)</span>
              </label>
              <InfoButton title="Horizontal vs Vertical Renovation">
                <HorizontalVsVerticalInfo />
              </InfoButton>
            </div>
            <Select
              options={MODIFICATION_TYPES}
              value={data.modificationType}
              onChange={set('modificationType')}
              placeholder="Select…"
            />
          </div>

          <RadioGroup
            label="Has an architect or engineer reviewed and signed off that the structure is sound for the rehab and temporary bracing is adequate to support the load?"
            options={['Yes', 'No']}
            value={data.architectSignoff}
            onChange={set('architectSignoff')}
          />
          <RadioGroup
            label="Have permits and financing been secured?"
            options={['Yes', 'No']}
            value={data.permitsSecured}
            onChange={set('permitsSecured')}
          />
        </div>
      )}

      <div className="pt-3">
        <FormGrid cols={2}>
          <Input label="Last Update to Roofing Year" value={data.roofingYear} onChange={set('roofingYear')} placeholder="YYYY" />
          <Input label="Last Update to Heating Year" value={data.heatingYear} onChange={set('heatingYear')} placeholder="YYYY" />
          <Input label="Last Update to Electrical Year" value={data.electricalYear} onChange={set('electricalYear')} placeholder="YYYY" />
          <Input label="Last Update to Plumbing Year" value={data.plumbingYear} onChange={set('plumbingYear')} placeholder="YYYY" />
        </FormGrid>
      </div>

      <div className="pt-4" style={{ borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}` }}>
        <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-3 mt-3">
          Optional Coverages
        </p>
        <div className="space-y-5">
          <FormGrid>
            <Select label="Temporary Storage" options={LIMIT_OPTIONS} value={coverage.tempStorage} onChange={setCov('tempStorage')} placeholder="Select…" />
            <Select label="Property in Transit" options={LIMIT_OPTIONS} value={coverage.transit} onChange={setCov('transit')} placeholder="Select…" />
          </FormGrid>
          <FormGrid>
            <Select label="Soft Costs" options={SOFT_COST_OPTIONS} value={coverage.softCosts} onChange={setCov('softCosts')} placeholder="Select…" />
            <Select label="Equipment Breakdown" options={['Included', 'Not Requested']} value={coverage.equipmentBreakdown} onChange={setCov('equipmentBreakdown')} placeholder="Select…" />
          </FormGrid>
        </div>
      </div>

    </div>
  )
}
