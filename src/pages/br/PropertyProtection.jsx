import { useEffect } from 'react'
import { Input, Select, FormGrid, RadioGroup, Checkbox } from '../../components/FormField'

const SECURITY_OPTIONS = ['Fence', 'Lighting', 'Security Cameras', 'Watchman', 'Private Security Patrol', 'Other', 'None']

// djb2-style hash so the same address always produces the same Risk Meter
// values — important for demo so reloads don't shuffle the numbers.
function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Stand-in for the real Risk Meter API call. Real integration would POST the
// address to Verisk's Risk Meter Online endpoint and return PPC + Wildfire
// score. Same shape, just deterministic mock values for demo.
function mockRiskMeter(address) {
  const h = hashStr((address || '').toLowerCase().trim())
  return {
    protectionClass: 1 + (h % 10),                       // PPC 1-10
    wildfireScore:   h % 31,                              // FireLine 0-30
    fireHydrantFt:   100 + (h % 1500),                    // 100-1600 ft
    fireStationMi:   (0.3 + ((h >> 3) % 50) / 10).toFixed(1), // 0.3-5.3 mi
  }
}

export default function PropertyProtection({ formData, updateFormData }) {
  const data = formData.propertyProtection || {}
  const set = (key) => (val) => updateFormData('propertyProtection', { [key]: val })

  // Watch the project address — once it's filled enough to identify a
  // location, populate the Risk Meter fields (Protection Class, Wildfire
  // Score, distances). Only fills empty fields so we don't clobber any
  // edits the user made by hand.
  const project = formData.project || {}
  const addrKey = [project.projectAddress, project.projectCity, project.projectState, project.projectZip].filter(Boolean).join(' | ')
  useEffect(() => {
    if (!project.projectAddress || !project.projectCity || !project.projectState) return
    const meter = mockRiskMeter(addrKey)
    const patch = {}
    if (!data.protectionClass)    patch.protectionClass = String(meter.protectionClass)
    if (!data.wildfireScore)      patch.wildfireScore = String(meter.wildfireScore)
    if (!data.fireHydrantDistance) patch.fireHydrantDistance = `${meter.fireHydrantFt} ft`
    if (!data.fireStationDistance) patch.fireStationDistance = `${meter.fireStationMi} mi`
    if (Object.keys(patch).length) updateFormData('propertyProtection', patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addrKey])

  const security = data.security || []
  const toggleSecurity = (opt) => {
    const next = security.includes(opt) ? security.filter(s => s !== opt) : [...security, opt]
    set('security')(next)
  }

  return (
    <div className="w-full space-y-5">
      <div className="rounded-xl p-4" style={{ background: 'rgba(248,246,255,0.5)', border: '1px solid rgba(92,46,212,0.12)' }}>
        <p className="text-[11px] font-bold tracking-wider uppercase mb-2.5" style={{ color: '#5C2ED4' }}>
          System-Populated (Risk Meter API)
        </p>
        <FormGrid>
          <Input label="Protection Class" value={data.protectionClass} onChange={set('protectionClass')} placeholder="API will populate" />
          <Input label="Wildfire Score" value={data.wildfireScore} onChange={set('wildfireScore')} placeholder="API will populate" />
        </FormGrid>
      </div>

      <RadioGroup
        label="Is there an active wildfire within 50 miles?"
        options={['Yes', 'No']}
        value={data.activeWildfire}
        onChange={set('activeWildfire')}
      />

      <div>
        <FormGrid>
          <Input label="Distance to Nearest Fire Hydrant" value={data.fireHydrantDistance} onChange={set('fireHydrantDistance')} placeholder="ft / mi (Google API)" />
          <Input label="Distance to Nearest Fire Station" value={data.fireStationDistance} onChange={set('fireStationDistance')} placeholder="mi (Google API)" />
        </FormGrid>
      </div>

      <div className="pt-3">
        <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">
          Jobsite Security <span className="font-normal text-gray-400">(check all that apply)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SECURITY_OPTIONS.map(opt => (
            <Checkbox key={opt} label={opt} checked={security.includes(opt)} onChange={() => toggleSecurity(opt)} />
          ))}
        </div>
        {security.includes('Other') && (
          <div className="mt-3">
            <FormGrid>
              <Input label="Specify other security" value={data.securityOther} onChange={set('securityOther')} />
              <div />
            </FormGrid>
          </div>
        )}
      </div>
    </div>
  )
}
