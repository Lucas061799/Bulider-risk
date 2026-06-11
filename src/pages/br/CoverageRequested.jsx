import { Input, Select, FormGrid, RadioGroup } from '../../components/FormField'
import InfoButton, { NoExistingStructureCoverageInfo, GLvsPremisesInfo } from '../../components/InfoButton'
import { PROJECT_TYPES } from '../../lib/projectTypeConfig'

const LIMIT_OPTIONS = ['$10,000 Included', '$25,000', '$100,000', '10% of Completed Value', '25% of Completed Value']
const SOFT_COST_OPTIONS = ['Not Requested', '$50,000 Included', '10% of Completed Value', '25% of Completed Value']

function MoneyInput({ label, value, onChange, required, hint }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9,.]/g, ''))}
          placeholder="0"
          className="w-full border rounded-lg pl-7 pr-3.5 py-2.5 text-sm border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40"
        />
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function CoverageRequested({ formData, updateFormData, projectType, config }) {
  const data = formData.coverage || {}
  const contractor = formData.contractor || {}
  const set = (key) => (val) => updateFormData('coverage', { [key]: val })

  const mode = config?.coverageMode || 'completed_value'

  return (
    <div className="w-full space-y-5">
      <div>

        {mode === 'completed_value' && (
          <MoneyInput label="Completed Value (excluding land)" required value={data.completedValue} onChange={set('completedValue')} />
        )}

        {mode === 'remodel_value' && (
          <>
            <MoneyInput
              label="Remodel Value (excluding land)"
              required
              value={data.remodelValue}
              onChange={set('remodelValue')}
            />
            <div className="mt-2 flex items-center gap-2">
              <InfoButton title="What's covered (and what isn't)">
                <NoExistingStructureCoverageInfo />
              </InfoButton>
              <span className="text-[11px] text-gray-500">The policy covers only the new construction or renovation work — not the existing building.</span>
            </div>
          </>
        )}

        {mode === 'split_value' && (
          <div className="space-y-4">
            <FormGrid>
              <MoneyInput label="New Work Value (Renovation Scope)" required value={data.newWorkValue} onChange={set('newWorkValue')} />
              <MoneyInput label="Existing Structure Value" required value={data.existingValue} onChange={set('existingValue')} />
            </FormGrid>
            <MoneyInput
              label="Total Completed Value (Combined)"
              value={
                (Number((data.newWorkValue || '').replace(/[^0-9.]/g, '')) +
                 Number((data.existingValue || '').replace(/[^0-9.]/g, ''))).toLocaleString()
              }
              onChange={() => {}}
              hint="Auto-calculated: New Work + Existing Structure"
            />
          </div>
        )}
      </div>

      <div className="pt-3">
        <div className="space-y-5">
          <FormGrid>
            <Select label="Temporary Storage" options={LIMIT_OPTIONS} value={data.tempStorage} onChange={set('tempStorage')} placeholder="Select…" />
            <Select label="Property in Transit" options={LIMIT_OPTIONS} value={data.transit} onChange={set('transit')} placeholder="Select…" />
          </FormGrid>
          <FormGrid>
            <Select label="Soft Costs" options={SOFT_COST_OPTIONS} value={data.softCosts} onChange={set('softCosts')} placeholder="Select…" />
            <Select label="Equipment Breakdown" options={['Included', 'Not Requested']} value={data.equipmentBreakdown} onChange={set('equipmentBreakdown')} placeholder="Select…" />
          </FormGrid>
        </div>
      </div>

      <div className="pt-3">
        <div className="flex items-center gap-2 mb-3">
          <InfoButton title="General Liability vs Premises Liability">
            <GLvsPremisesInfo />
          </InfoButton>
        </div>

        {contractor.insuredIsGC === 'Yes' ? (
          <div className="text-[12px] text-gray-500 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,246,255,0.6)', border: '1px dashed #E5E7EB' }}>
            Premises Liability not available — the Named Insured is the General Contractor (covered under their GL).
          </div>
        ) : (
          <RadioGroup
            label="Premises Liability"
            options={['Included', 'Not Requested']}
            value={data.premisesLiability}
            onChange={set('premisesLiability')}
          />
        )}
      </div>
    </div>
  )
}
