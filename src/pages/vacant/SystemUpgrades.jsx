import { Input, FormGrid } from '../../components/FormField'

export default function VacSystemUpgrades({ formData, updateFormData }) {
  const data = formData.vacSystemUpgrades || {}
  const set = (key) => (val) => updateFormData('vacSystemUpgrades', { [key]: val })

  return (
    <div className="w-full space-y-3">
      <p className="text-[12px] text-gray-500">Last update year for each major system in the existing structure.</p>
      <FormGrid>
        <Input label="Roof" value={data.roofYear} onChange={set('roofYear')} placeholder="YYYY" />
        <Input label="Heating" value={data.heatingYear} onChange={set('heatingYear')} placeholder="YYYY" />
        <Input label="Electrical" value={data.electricalYear} onChange={set('electricalYear')} placeholder="YYYY" />
        <Input label="Plumbing" value={data.plumbingYear} onChange={set('plumbingYear')} placeholder="YYYY" />
      </FormGrid>
    </div>
  )
}
