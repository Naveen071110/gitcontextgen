import * as path from 'path';
import { synchronizeRules, watchRules, SyncResult } from '../rulesSync.js';

export interface SyncOptions {
  watch?: boolean;
}

export async function executeSync(targetPath?: string, options: SyncOptions = {}): Promise<void> {
  const workspaceDir = targetPath ? path.resolve(targetPath) : process.cwd();

  console.log('\n' + '='.repeat(72));
  console.log('🔄 GitContextGen Bidirectional Rules Synchronizer');
  console.log('='.repeat(72));
  console.log(`Target Workspace: ${workspaceDir}\n`);

  const initialResults = synchronizeRules(workspaceDir);
  if (initialResults.length > 0) {
    for (const res of initialResults) {
      console.log(`✅ Synchronized: ${res.direction} (${path.basename(res.sourceFile)} ➔ ${path.basename(res.targetFile)})`);
    }
  } else {
    console.log('✨ All rule files (CLAUDE.md & .cursor/rules/*.mdc) are currently in sync.');
  }

  if (options.watch) {
    console.log('\n👀 Watching workspace for rule changes (Press Ctrl+C to exit)...');
    watchRules(workspaceDir, (results: SyncResult[]) => {
      for (const res of results) {
        console.log(`[Sync Event] ${res.direction}: ${path.basename(res.targetFile)} updated with alwaysApply: true preserved.`);
      }
    });


    // Keep event loop alive
    await new Promise(() => {});
  }
}
