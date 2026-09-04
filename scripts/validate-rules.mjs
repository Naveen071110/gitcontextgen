#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

console.log('='.repeat(72));
console.log('🔍 Running Cursor & Claude Rule Harmonization Linter');
console.log('='.repeat(72));

const cursorMdcPath = path.join(repoRoot, '.cursor', 'rules', 'project-rules.mdc');
const claudeMdPath = path.join(repoRoot, 'CLAUDE.md');

let hasError = false;

// 1. Check .cursor/rules/project-rules.mdc existence
if (!fs.existsSync(cursorMdcPath)) {
  console.error('❌ Missing file: .cursor/rules/project-rules.mdc does not exist');
  hasError = true;
} else {
  const mdcRaw = fs.readFileSync(cursorMdcPath, 'utf-8');

  // Check YAML Frontmatter
  const yamlMatch = mdcRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!yamlMatch) {
    console.error('❌ Invalid frontmatter: .cursor/rules/project-rules.mdc does not start with valid YAML frontmatter (---)');
    hasError = true;
  } else {
    const yamlBody = yamlMatch[1];
    if (!yamlBody.includes('alwaysApply: true')) {
      console.error('❌ Missing rule directive: .cursor/rules/project-rules.mdc frontmatter must contain "alwaysApply: true"');
      hasError = true;
    } else {
      console.log('✅ Cursor Frontmatter Verified: Valid YAML header with "alwaysApply: true" detected');
    }
  }

  // Check link to CLAUDE.md
  if (!mdcRaw.includes('CLAUDE.md')) {
    console.error('❌ Asymmetric rule link: .cursor/rules/project-rules.mdc must reference CLAUDE.md as single source of truth');
    hasError = true;
  } else {
    console.log('✅ Cursor Harmonization Verified: Cross-references CLAUDE.md');
  }
}

// 2. Check CLAUDE.md existence & symmetry
if (!fs.existsSync(claudeMdPath)) {
  console.error('❌ Missing file: CLAUDE.md does not exist');
  hasError = true;
} else {
  const claudeRaw = fs.readFileSync(claudeMdPath, 'utf-8');
  if (!claudeRaw.includes('project-rules.mdc')) {
    console.error('❌ Asymmetric rule link: CLAUDE.md must reference .cursor/rules/project-rules.mdc');
    hasError = true;
  } else {
    console.log('✅ Claude Harmonization Verified: Cross-references .cursor/rules/project-rules.mdc');
  }
}

if (hasError) {
  console.error('\n' + '='.repeat(72));
  console.error('❌ Rule Harmonization Lint Failed. Please resolve the symmetry errors above.');
  console.error('='.repeat(72) + '\n');
  process.exit(1);
} else {
  console.log('\n' + '='.repeat(72));
  console.log('🎉 Rule Harmonization Lint Passed: 100% IDE Rule Portability & Symmetry');
  console.log('='.repeat(72) + '\n');
  process.exit(0);
}
