export interface VulnerabilityFinding {
  package: string;
  version?: string;
  id: string; // CVE or GHSA
  summary: string;
  severity?: string;
  detailsUrl?: string;
}

export interface VulnerabilityAuditSummary {
  totalVulnerabilities: number;
  criticalCount: number;
  findings: VulnerabilityFinding[];
  safetyBoundaryWarning: string | null;
}

/**
 * Queries Google OSV.dev batch API for open-source package vulnerabilities
 * https://api.osv.dev/v1/querybatch (Free, No Auth required, High speed)
 */
export async function auditPackageVulnerabilities(
  dependencies: Record<string, string>,
  ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' = 'npm'
): Promise<VulnerabilityAuditSummary> {
  const pkgEntries = Object.entries(dependencies).slice(0, 40); // Cap to top 40 dependencies for sub-second execution

  if (pkgEntries.length === 0) {
    return {
      totalVulnerabilities: 0,
      criticalCount: 0,
      findings: [],
      safetyBoundaryWarning: null,
    };
  }

  const queries = pkgEntries.map(([pkgName, versionRaw]) => {
    // Strip semver prefix (~, ^, >=, etc.)
    const cleanVersion = versionRaw.replace(/^[\^~>=<v\s]+/, '').split(' ')[0];
    const queryObj: { package: { name: string; ecosystem: string }; version?: string } = {
      package: {
        name: pkgName,
        ecosystem: ecosystem === 'npm' ? 'npm' : ecosystem === 'PyPI' ? 'PyPI' : ecosystem === 'crates.io' ? 'crates.io' : 'Go',
      },
    };
    if (cleanVersion && /^\d+\.\d+/.test(cleanVersion)) {
      queryObj.version = cleanVersion;
    }
    return queryObj;
  });

  try {
    const res = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries }),
      next: { revalidate: 86400 }, // Cache results for 24h
    });

    if (!res.ok) {
      return {
        totalVulnerabilities: 0,
        criticalCount: 0,
        findings: [],
        safetyBoundaryWarning: null,
      };
    }

    const data = await res.json();
    const results: any[] = data.results || [];
    const findings: VulnerabilityFinding[] = [];
    let criticalCount = 0;

    results.forEach((r, idx) => {
      const pkgName = pkgEntries[idx][0];
      const vulns = r.vulns || [];
      vulns.forEach((v: any) => {
        const isCritical = (v.database_specific?.severity === 'CRITICAL' || v.database_specific?.severity === 'HIGH');
        if (isCritical) criticalCount++;

        findings.push({
          package: pkgName,
          version: pkgEntries[idx][1],
          id: v.id || 'CVE-UNKNOWN',
          summary: v.summary || v.details?.slice(0, 120) || 'Known security vulnerability in dependency.',
          severity: v.database_specific?.severity || 'MEDIUM',
          detailsUrl: `https://osv.dev/vulnerability/${v.id}`,
        });
      });
    });

    let safetyBoundaryWarning: string | null = null;
    if (findings.length > 0) {
      safetyBoundaryWarning = `⚠️ Boundary Safety Alert: ${findings.length} known open-source vulnerabilities detected in dependencies (${criticalCount} High/Critical). Review and isolate legacy package APIs.`;
    }

    return {
      totalVulnerabilities: findings.length,
      criticalCount,
      findings: findings.slice(0, 5), // Keep top 5 for prompt density
      safetyBoundaryWarning,
    };
  } catch (err) {
    // Fail silently on network errors to ensure zero disruption to core prompt generation
    return {
      totalVulnerabilities: 0,
      criticalCount: 0,
      findings: [],
      safetyBoundaryWarning: null,
    };
  }
}
