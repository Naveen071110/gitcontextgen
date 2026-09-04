#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

/**
 * Strict RegExp pattern matching sensitive keys, certificates, local databases, and environment secrets.
 */
const SENSITIVE_FILE_REGEX = /\.(pem|key|pkcs12|pfx|p12|kdb|sqlite|sqlite3|rdb|env(\..+)?)$|^(id_rsa|id_dsa|id_ecdsa|id_ed25519|secrets?|credentials|service-account|master\.key)$/i;

const DEFAULT_IGNORES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.open-next',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv',
  'target',
  '.wrangler',
]);

function runPreCommitCheck() {
  const startTime = Date.now();
  let stagedFilesRaw = '';

  try {
    stagedFilesRaw = execSync('git diff --cached --name-only', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    // If not in a git repo or no commits yet, exit cleanly
    process.exit(0);
  }

  if (!stagedFilesRaw) {
    process.exit(0);
  }

  const stagedFiles = stagedFilesRaw
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const flaggedFiles = [];

  for (const file of stagedFiles) {
    const normalized = file.replace(/\\/g, '/');
    const parts = normalized.split('/');

    // Fast-path bypass for standard build/package ignore trees (<1ms)
    if (parts.some((part) => DEFAULT_IGNORES.has(part))) {
      continue;
    }

    const basename = path.basename(normalized);
    if (SENSITIVE_FILE_REGEX.test(basename) || SENSITIVE_FILE_REGEX.test(normalized)) {
      flaggedFiles.push(file);
    }
  }

  const durationMs = Date.now() - startTime;

  if (flaggedFiles.length > 0) {
    console.error('\n' + '='.repeat(72));
    console.error('🚨 [SECURITY GUARD BLOCK] Pre-commit Hook Aborted Commit');
    console.error('='.repeat(72));
    console.error('The following staged file(s) match sensitive credential/secret patterns:\n');
    for (const file of flaggedFiles) {
      console.error(`   ❌ ${file}`);
    }
    console.error('\nRemediation Steps:');
    console.error('   1. Unstage the sensitive file(s):');
    for (const file of flaggedFiles) {
      console.error(`      git reset HEAD "${file}"`);
    }
    console.error('   2. Add the file pattern to .gitignore to prevent future accidental staging.');
    console.error('   3. If real credentials were previously pushed, rotate them immediately.');
    console.error(`\n(Security scan executed in ${durationMs}ms)`);
    console.error('='.repeat(72) + '\n');
    process.exit(1);
  }

  console.log(`🛡️  [Pre-Commit Security Guard] Clean: 0 sensitive leaks found (${durationMs}ms)`);
  process.exit(0);
}

runPreCommitCheck();
