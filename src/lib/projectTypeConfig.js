// Builder's Risk Marketplace — project type configuration
// Each project type drives: which sections render, which carriers quote, which bind attestation shows.

export const PROJECT_TYPES = {
  GROUND_UP: 'ground_up',
  REMODEL_WITHOUT_EXISTING: 'remodel_without_existing',
  REMODEL_WITH_EXISTING: 'remodel_with_existing',
  VACANT_LAND: 'vacant_land',
  VACANT_DWELLING: 'vacant_dwelling',
  VACANT_COMMERCIAL: 'vacant_commercial',
}

// Carriers available in the marketplace
export const CARRIERS = {
  GAIC: {
    id: 'gaic',
    name: 'Great American',
    program: 'OneShot',
    type: 'Admitted',
    commission: 0.125,
    apiIntegrated: false,
    platformFunctionality: 'Quote, Bind & Issue',
    primaryTarget: "Builder's Risk",
  },
  NAVIGATORS: {
    id: 'navigators',
    name: 'Navigators (The Hartford)',
    program: 'Rivet',
    type: 'Admitted',
    commission: 0.125,
    apiIntegrated: false,
    platformFunctionality: 'Quote, Bind & Issue',
    primaryTarget: "Builder's Risk",
  },
  ATRIUM: {
    id: 'atrium',
    name: "Atrium (Lloyd's)",
    program: 'Atrium',
    type: 'Non-Admitted',
    commission: 0.10,
    apiIntegrated: true,
    platformFunctionality: 'Quote Only (Phase 1)',
    primaryTarget: 'Vacant Dwelling',
    flatPolicyFee: 150,
  },
}

// Policy fee tiers for GAIC + Navigators (premium-driven)
export function calcPolicyFee(carrierId, premium) {
  if (carrierId === CARRIERS.ATRIUM.id) return 150
  if (premium <= 2500) return 75
  if (premium <= 5000) return 100
  return 150
}

// GAIC's 10 currently-programmed states (Phase 1 limitation)
export const GAIC_APPROVED_STATES = ['AZ', 'CA', 'CO', 'FL', 'GA', 'NV', 'OR', 'PA', 'TX', 'WA']

// All US states
export const ALL_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

// ── SECTION KEYS ────────────────────────────────────────────────────────────
// One key per discrete section component. Used to look up the page component.
export const SECTIONS = {
  APPLICANT: 'applicant',
  CONTRACTOR: 'contractor',
  PROJECT: 'project',
  EXISTING_STRUCTURE: 'existingStructure',
  COVERAGE: 'coverage',
  LIABILITY: 'liabilitySelection',
  PROPERTY_PROTECTION: 'propertyProtection',
  ELIGIBILITY: 'eligibility',
  LOSS_HISTORY: 'lossHistory',
  FINANCIAL: 'financial',
  EXISTING_COVERAGE: 'existingCoverage',
  PROJECT_CONDITIONS: 'projectConditions',
  ADDITIONAL_INTERESTS: 'additionalInterests',
  BIND_CONFIRMATION: 'bindConfirmation',

  // Vacant Dwelling-only sections
  VAC_RISK: 'vacRisk',
  VAC_SYSTEM_UPGRADES: 'vacSystemUpgrades',
  VAC_VACANCY: 'vacVacancy',
  VAC_PROPERTY_RISK: 'vacPropertyRisk',
  VAC_UNDERWRITING: 'vacUnderwriting',
  VAC_VALUES: 'vacValues',
  VAC_CONTRACTOR: 'vacContractor',
  VAC_DEDUCTIBLES: 'vacDeductibles',
  VAC_MAINTENANCE: 'vacMaintenance',
  VAC_LOSS: 'vacLoss',
}

// Project type configuration: pretty name, eligible carriers, the section flow, bind copy.
export const PROJECT_TYPE_CONFIG = {
  [PROJECT_TYPES.GROUND_UP]: {
    label: 'New Construction (Ground Up)',
    shortLabel: 'New Construction',
    description: 'Brand-new structure — no existing building on site.',
    icon: 'construction',
    carriers: ['gaic', 'navigators'],
    steps: [
      { id: 1, label: 'Applicant',            key: SECTIONS.APPLICANT },
      { id: 2, label: 'Contractor',           key: SECTIONS.CONTRACTOR },
      { id: 3, label: 'Project',              key: SECTIONS.PROJECT },
      { id: 4, label: 'Coverage',             key: SECTIONS.COVERAGE },
      { id: 5, label: 'Liability',            key: SECTIONS.LIABILITY },
      { id: 6, label: 'Property Protection',  key: SECTIONS.PROPERTY_PROTECTION },
      { id: 7, label: 'Eligibility',          key: SECTIONS.ELIGIBILITY },
      { id: 8, label: 'Loss History',         key: SECTIONS.LOSS_HISTORY },
      { id: 9, label: 'Financial',            key: SECTIONS.FINANCIAL },
      { id: 10, label: 'Existing Coverage',   key: SECTIONS.EXISTING_COVERAGE },
      { id: 11, label: 'Additional Interests', key: SECTIONS.ADDITIONAL_INTERESTS },
      { id: 12, label: 'Bind Confirmation',   key: SECTIONS.BIND_CONFIRMATION },
    ],
    bindAttestation: {
      title: 'Confirm Project Has Not Started',
      body: 'By binding coverage, the Agent certifies that they have confirmed with the applicant that no construction, demolition, renovation, remodeling, site work, installation, or other project-related work has commenced, and no portion of the insured project has been completed, prior to the effective inception date of this policy. The Agent acknowledges that this policy is intended to insure only projects that have not yet started as of the policy inception date. Any work performed, materials installed, or project activities completed prior to the inception date are not covered unless specifically accepted by the insurer in writing.',
      checkbox: 'I certify that I have confirmed with the applicant that no construction or project-related work has started or been completed prior to the inception date of this policy.',
    },
    coverageMode: 'completed_value', // single completed value field
  },

  [PROJECT_TYPES.REMODEL_WITHOUT_EXISTING]: {
    label: 'Remodel / Renovation · No Existing Structure Coverage',
    shortLabel: 'Remodel (No ES)',
    description: 'Renovation where only the new work is covered, not the existing building.',
    icon: 'remodel-no-es',
    carriers: ['gaic', 'navigators'],
    steps: [
      { id: 1, label: 'Applicant',            key: SECTIONS.APPLICANT },
      { id: 2, label: 'Contractor',           key: SECTIONS.CONTRACTOR },
      { id: 3, label: 'Project',              key: SECTIONS.PROJECT },
      { id: 4, label: 'Coverage',             key: SECTIONS.COVERAGE },
      { id: 5, label: 'Liability',            key: SECTIONS.LIABILITY },
      { id: 6, label: 'Property Protection',  key: SECTIONS.PROPERTY_PROTECTION },
      { id: 7, label: 'Eligibility',          key: SECTIONS.ELIGIBILITY },
      { id: 8, label: 'Loss History',         key: SECTIONS.LOSS_HISTORY },
      { id: 9, label: 'Financial',            key: SECTIONS.FINANCIAL },
      { id: 10, label: 'Existing Coverage',   key: SECTIONS.EXISTING_COVERAGE },
      { id: 11, label: 'Additional Interests', key: SECTIONS.ADDITIONAL_INTERESTS },
      { id: 12, label: 'Bind Confirmation',   key: SECTIONS.BIND_CONFIRMATION },
    ],
    bindAttestation: {
      title: 'Confirm No Existing Structure Coverage',
      body: 'This policy will only cover the new construction or renovation work, NOT the existing building. The existing structure itself, pre-existing portions of the property, and any damage that originates in or affects the old structure are NOT covered.',
      checkbox: 'I acknowledge that I am binding coverage with no existing structure coverage.',
    },
    coverageMode: 'remodel_value', // single remodel value field, IE explains exclusions
  },

  [PROJECT_TYPES.REMODEL_WITH_EXISTING]: {
    label: 'Remodel / Renovation · With Existing Structure Coverage',
    shortLabel: 'Remodel (With ES)',
    description: 'Renovation where both the new work AND the existing building are covered.',
    icon: 'remodel-with-es',
    carriers: ['gaic', 'navigators'],
    steps: [
      { id: 1, label: 'Applicant',            key: SECTIONS.APPLICANT },
      { id: 2, label: 'Contractor',           key: SECTIONS.CONTRACTOR },
      { id: 3, label: 'Project',              key: SECTIONS.PROJECT },
      { id: 4, label: 'Coverage',             key: SECTIONS.COVERAGE },
      { id: 5, label: 'Existing Structure',   key: SECTIONS.EXISTING_STRUCTURE },
      { id: 6, label: 'Liability',            key: SECTIONS.LIABILITY },
      { id: 7, label: 'Property Protection',  key: SECTIONS.PROPERTY_PROTECTION },
      { id: 8, label: 'Eligibility',          key: SECTIONS.ELIGIBILITY },
      { id: 9, label: 'Loss History',         key: SECTIONS.LOSS_HISTORY },
      { id: 10, label: 'Financial',           key: SECTIONS.FINANCIAL },
      { id: 11, label: 'Existing Coverage',   key: SECTIONS.EXISTING_COVERAGE },
      { id: 12, label: 'Additional Interests', key: SECTIONS.ADDITIONAL_INTERESTS },
      { id: 13, label: 'Bind Confirmation',   key: SECTIONS.BIND_CONFIRMATION },
    ],
    bindAttestation: {
      title: 'Confirm Application Details',
      body: 'By binding coverage, the Agent certifies that all information provided regarding the existing structure (year built, system upgrades, structural modifications) is accurate to the best of their knowledge.',
      checkbox: 'I certify that the existing structure information provided is accurate.',
    },
    coverageMode: 'split_value', // new work value + existing structure value = total
  },

  [PROJECT_TYPES.VACANT_DWELLING]: {
    label: 'Vacant Dwelling',
    shortLabel: 'Vacant Dwelling',
    description: 'Single-family or multi-family dwelling currently vacant.',
    icon: 'vacant-dwelling',
    carriers: ['atrium'],
    steps: [
      { id: 1, label: 'Applicant',            key: SECTIONS.APPLICANT },
      { id: 2, label: 'Risk Information',     key: SECTIONS.VAC_RISK },
      { id: 3, label: 'System Upgrades',      key: SECTIONS.VAC_SYSTEM_UPGRADES },
      { id: 4, label: 'Vacancy Eligibility',  key: SECTIONS.VAC_VACANCY },
      { id: 5, label: 'Property Condition',   key: SECTIONS.VAC_PROPERTY_RISK },
      { id: 6, label: 'Underwriting',         key: SECTIONS.VAC_UNDERWRITING },
      { id: 7, label: 'Values & Coverage',    key: SECTIONS.VAC_VALUES },
      { id: 8, label: 'Contractor',           key: SECTIONS.VAC_CONTRACTOR },
      { id: 9, label: 'Deductibles',          key: SECTIONS.VAC_DEDUCTIBLES },
      { id: 10, label: 'Property Maintenance', key: SECTIONS.VAC_MAINTENANCE },
      { id: 11, label: 'Loss History',        key: SECTIONS.VAC_LOSS },
    ],
    bindAttestation: null, // Atrium is Quote-Only Phase 1
    coverageMode: 'split_value',
  },

  // Vacant Land / Vacant Commercial → bridge to USLI (no in-app form)
  [PROJECT_TYPES.VACANT_LAND]: {
    label: 'Vacant Land',
    shortLabel: 'Vacant Land',
    description: 'Undeveloped land with no structure. Bridged to USLI.',
    icon: 'vacant-land',
    carriers: ['usli'],
    bridgeToUSLI: true,
  },
  [PROJECT_TYPES.VACANT_COMMERCIAL]: {
    label: 'Vacant Commercial',
    shortLabel: 'Vacant Commercial',
    description: 'Vacant commercial building. Bridged to USLI.',
    icon: 'vacant-commercial',
    carriers: ['usli'],
    bridgeToUSLI: true,
  },
}

// Helper: lookup a project type config; returns null if not found.
export function getProjectConfig(projectType) {
  return PROJECT_TYPE_CONFIG[projectType] || null
}

// Helper: which carriers should we attempt to quote against, given the type + state?
export function eligibleCarriers(projectType, state) {
  const cfg = getProjectConfig(projectType)
  if (!cfg || !cfg.carriers) return []
  // GAIC: only 10 states currently
  return cfg.carriers.filter((id) => {
    if (id === 'gaic') return GAIC_APPROVED_STATES.includes(state)
    return true
  })
}

// Helper: is this project type a BR (vs Vacant Dwelling vs USLI bridge)?
export function isBuildersRiskFlow(projectType) {
  return [
    PROJECT_TYPES.GROUND_UP,
    PROJECT_TYPES.REMODEL_WITHOUT_EXISTING,
    PROJECT_TYPES.REMODEL_WITH_EXISTING,
  ].includes(projectType)
}

export function isVacantDwellingFlow(projectType) {
  return projectType === PROJECT_TYPES.VACANT_DWELLING
}

export function isUSLIBridge(projectType) {
  return projectType === PROJECT_TYPES.VACANT_LAND || projectType === PROJECT_TYPES.VACANT_COMMERCIAL
}
