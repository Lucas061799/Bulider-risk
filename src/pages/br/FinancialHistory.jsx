import { Input, FormGrid, RadioGroup, Textarea } from '../../components/FormField'

export default function FinancialHistory({ formData, updateFormData }) {
  const data = formData.financial || {}
  const set = (key) => (val) => updateFormData('financial', { [key]: val })

  return (
    <div className="w-full space-y-5">
      <RadioGroup
        label="Bankruptcy in past 10 years?"
        options={['Yes', 'No']}
        value={data.bankruptcy}
        onChange={set('bankruptcy')}
      />

      <div>
        <RadioGroup
          label="Policy canceled or non-renewed in past 3 years?"
          options={['Yes', 'No']}
          value={data.policyCanceled}
          onChange={set('policyCanceled')}
        />
        {data.policyCanceled === 'Yes' && (
          <div className="mt-3">
            <Textarea
              label="Explanation"
              rows={3}
              value={data.cancellationExplanation}
              onChange={set('cancellationExplanation')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
