import { Input, FormGrid, RadioGroup, DateInput, Textarea } from '../../components/FormField'
import ProjectConditions from './ProjectConditions'

export default function ExistingCoverage({ formData, updateFormData, isDark }) {
  const data = formData.existingCoverage || {}
  const set = (key) => (val) => updateFormData('existingCoverage', { [key]: val })

  return (
    <div className="w-full space-y-5">
      <div>
        <RadioGroup
          label="Is this replacing existing builder's risk coverage?"
          options={['Yes', 'No']}
          value={data.replacingExisting}
          onChange={set('replacingExisting')}
        />
        {data.replacingExisting === 'Yes' && (
          <div className="mt-3">
            <Input label="Prior Carrier" value={data.priorCarrier} onChange={set('priorCarrier')} />
          </div>
        )}
      </div>

      <div>
        <RadioGroup
          label="Has construction already begun?"
          options={['Yes', 'No']}
          value={data.constructionBegun}
          onChange={set('constructionBegun')}
        />
        {data.constructionBegun === 'Yes' && (
          <>
            <div className="mt-3 space-y-4 p-4 rounded-xl" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
              <FormGrid>
                <DateInput label="Start Date" value={data.startDate} onChange={set('startDate')} />
                <Input label="% Complete" value={data.percentComplete} onChange={set('percentComplete')} placeholder="0–100" />
              </FormGrid>
              <FormGrid>
                <Input label="Work Completed Value" value={data.completedValue} onChange={set('completedValue')} placeholder="$" />
                <Input label="Remaining Value" value={data.remainingValue} onChange={set('remainingValue')} placeholder="$" />
              </FormGrid>
              <Textarea
                label="Reason for switching coverage"
                rows={2}
                value={data.switchReason}
                onChange={set('switchReason')}
              />
            </div>

            {/* Project Conditions & Description — gated by the same
                "Has construction already begun?" Yes answer, since these
                questions are about a project already underway. */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px dashed #E5E7EB' }}>
              <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-3 mt-3">
                Project Conditions &amp; Description
              </p>
              <ProjectConditions formData={formData} updateFormData={updateFormData} isDark={isDark} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
