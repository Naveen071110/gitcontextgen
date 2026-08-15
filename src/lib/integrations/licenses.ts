/**
 * SPDX License Compliance & Guardrails Integration
 * Maps SPDX license identifiers to strict AI agent boundary rules
 */

export interface LicenseGuardrail {
  spdxId: string;
  name: string;
  isCopyleft: boolean;
  commercialUse: boolean;
  promptConstraintRule: string;
}

const KNOWN_LICENSES: Record<string, { name: string; isCopyleft: boolean; commercialUse: boolean; rule: string }> = {
  'MIT': {
    name: 'MIT License',
    isCopyleft: false,
    commercialUse: true,
    rule: '- **License Compliance (MIT)**: Permissive open-source license. Preserve copyright notices when generating new public distribution files.',
  },
  'Apache-2.0': {
    name: 'Apache License 2.0',
    isCopyleft: false,
    commercialUse: true,
    rule: '- **License Compliance (Apache-2.0)**: Permissive license with explicit patent grants. Preserve NOTICE files and license headers on all new source files.',
  },
  'GPL-3.0': {
    name: 'GNU General Public License v3.0',
    isCopyleft: true,
    commercialUse: true,
    rule: '- **License Compliance (GPL-3.0 Copyleft)**: Strict copyleft license. Ensure all added dependencies and modules are license-compatible and maintain open-source distribution obligations.',
  },
  'AGPL-3.0': {
    name: 'GNU Affero General Public License v3.0',
    isCopyleft: true,
    commercialUse: true,
    rule: '- **License Compliance (AGPL-3.0 Strong Copyleft)**: Strong network-triggered copyleft license. Network interaction requires corresponding source availability.',
  },
  'BSD-3-Clause': {
    name: 'BSD 3-Clause License',
    isCopyleft: false,
    commercialUse: true,
    rule: '- **License Compliance (BSD-3-Clause)**: Permissive license. Do not use repository owner or contributor names for endorsement without explicit permission.',
  },
  'ISC': {
    name: 'ISC License',
    isCopyleft: false,
    commercialUse: true,
    rule: '- **License Compliance (ISC)**: Permissive license functionally equivalent to MIT.',
  },
};

export function getLicenseGuardrail(spdxId?: string | null): LicenseGuardrail {
  const cleanId = (spdxId || '').trim();
  const matched = KNOWN_LICENSES[cleanId];

  if (matched) {
    return {
      spdxId: cleanId,
      name: matched.name,
      isCopyleft: matched.isCopyleft,
      commercialUse: matched.commercialUse,
      promptConstraintRule: matched.rule,
    };
  }

  return {
    spdxId: cleanId || 'NOASSERTION',
    name: cleanId ? `${cleanId} License` : 'Custom / Unspecified License',
    isCopyleft: false,
    commercialUse: true,
    promptConstraintRule: cleanId
      ? `- **License Compliance (${cleanId})**: Adhere to \`${cleanId}\` terms when adding external dependencies or exporting source artifacts.`
      : `- **License Compliance**: Maintain clean dependency boundaries and respect existing copyright headers.`,
  };
}
