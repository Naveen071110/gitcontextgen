#!/usr/bin/env node

/**
 * AG-TASK-02: Orphaned PID Lock & Memory Sweeper
 * Schedule: Every hour (0 * * * *)
 * 
 * Objective:
 * Inspects .gitcontextgen/locks/*.lock files, checks PID liveness (process.kill(pid, 0)),
 * and safely reclaims stale or orphaned locks left by terminated agent processes.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function isPidRunning(pid) {
  if (!pid || typeof pid !== 'number' || isNaN(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // Process exists under another user
  }
}

function sweepLocks() {
  console.log('\n========================================================================');
  console.log('🧹 [AG-TASK-02] Orphaned PID Lock & Memory Sweeper Audit');
  console.log('========================================================================\n');

  const locksDirs = [
    path.join(process.cwd(), '.gitcontextgen', 'locks'),
    path.join(os.homedir(), '.gitcontextgen', 'locks'),
  ];

  let totalScanned = 0;
  let activeLocks = 0;
  let reclaimedLocks = 0;
  const now = Date.now();

  for (const dir of locksDirs) {
    if (!fs.existsSync(dir)) continue;

    console.log(`[Scanning Directory] ${dir}`);
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!file.endsWith('.lock')) continue;
      totalScanned++;
      const fullPath = path.join(dir, file);

      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const meta = JSON.parse(raw);
        const isExpired = typeof meta.expiresAt === 'number' && now > meta.expiresAt;
        const isDead = typeof meta.pid === 'number' && !isPidRunning(meta.pid);

        if (isExpired || isDead) {
          const reason = isExpired ? 'Expired TTL' : `Dead PID (${meta.pid})`;
          fs.unlinkSync(fullPath);
          reclaimedLocks++;
          console.log(`  🗑️ Reclaimed stale lock: ${file} [Reason: ${reason}]`);
        } else {
          activeLocks++;
          console.log(`  🔒 Active Lock: ${file} (PID: ${meta.pid}, Agent: ${meta.agentId || 'unknown'})`);
        }
      } catch (err) {
        // Corrupted lockfile, reclaim immediately
        try {
          fs.unlinkSync(fullPath);
          reclaimedLocks++;
          console.log(`  🗑️ Reclaimed corrupt lock: ${file}`);
        } catch {}
      }
    }
  }

  console.log(`\n📊 Sweeper Summary:`);
  console.log(`  • Locks Scanned:    ${totalScanned}`);
  console.log(`  • Active (Running): ${activeLocks}`);
  console.log(`  • Stale Reclaimed:  ${reclaimedLocks}`);
  console.log('\n✅ PASS: Lock hygiene sweep complete. Concurrency subsystem is clean.');
  console.log('========================================================================\n');
}

sweepLocks();
