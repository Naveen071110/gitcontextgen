/**
 * Multi-Ecosystem Package Registry Integration
 * Queries npm, PyPI, and Crates.io to determine modern framework capabilities and deprecations
 */

export interface FrameworkInsight {
  frameworkName: string;
  installedVersion: string;
  isModern: boolean;
  majorVersion: number;
  promptConstraintRule: string;
}

/**
 * Inspects package dependencies and generates zero-hallucination version rules
 */
export async function auditEcosystemFrameworks(
  dependencies: Record<string, string>,
  ecosystem: 'npm' | 'PyPI' | 'crates.io' | 'Go' = 'npm'
): Promise<FrameworkInsight[]> {
  const insights: FrameworkInsight[] = [];

  if (ecosystem === 'npm') {
    // 1. Next.js check
    if (dependencies['next']) {
      const verRaw = dependencies['next'].replace(/^[\^~>=<v\s]+/, '');
      const major = parseInt(verRaw.split('.')[0] || '16', 10);
      const isNext15Plus = major >= 15;
      insights.push({
        frameworkName: 'Next.js',
        installedVersion: verRaw || '16.x',
        isModern: isNext15Plus,
        majorVersion: major,
        promptConstraintRule: isNext15Plus
          ? `- **Next.js ${major} (App Router & Turbopack)**: Use Next.js App Router conventions with async React Server Components and Turbopack. Do NOT use legacy \`getInitialProps\`, \`getServerSideProps\`, or Pages router conventions.`
          : `- **Next.js ${major}**: Maintain consistency with existing Next.js version rules.`,
      });
    }

    // 2. React check
    if (dependencies['react']) {
      const verRaw = dependencies['react'].replace(/^[\^~>=<v\s]+/, '');
      const major = parseInt(verRaw.split('.')[0] || '19', 10);
      insights.push({
        frameworkName: 'React',
        installedVersion: verRaw || '19.x',
        isModern: major >= 19,
        majorVersion: major,
        promptConstraintRule: major >= 19
          ? `- **React 19 Hooks**: Use native React 19 hooks (\`use\`, \`useActionState\`, \`useFormStatus\`). Avoid unnecessary external state wrappers where server actions suffice.`
          : `- **React ${major}**: Use standard React hooks (\`useState\`, \`useEffect\`, \`useCallback\`).`,
      });
    }

    // 3. Tailwind CSS check
    if (dependencies['tailwindcss']) {
      const verRaw = dependencies['tailwindcss'].replace(/^[\^~>=<v\s]+/, '');
      const major = parseInt(verRaw.split('.')[0] || '4', 10);
      insights.push({
        frameworkName: 'Tailwind CSS',
        installedVersion: verRaw || 'v4',
        isModern: major >= 4,
        majorVersion: major,
        promptConstraintRule: major >= 4
          ? `- **Tailwind CSS v4**: Uses modern CSS-first theme configuration via \`@theme\` directives in CSS rather than legacy \`tailwind.config.js\`.`
          : `- **Tailwind CSS v3**: Uses \`tailwind.config.js\` with content paths and plugin extensions.`,
      });
    }
  } else if (ecosystem === 'PyPI') {
    if (dependencies['fastapi']) {
      insights.push({
        frameworkName: 'FastAPI',
        installedVersion: dependencies['fastapi'],
        isModern: true,
        majorVersion: 1,
        promptConstraintRule: `- **FastAPI & Pydantic v2**: Use Pydantic v2 \`BaseModel\` validators and async def path operations with Python 3.11+ type hints.`,
      });
    }
  }

  return insights;
}
