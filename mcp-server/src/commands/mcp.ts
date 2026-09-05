import { runMcpServer } from '../index.js';

export async function executeMcp(): Promise<void> {
  await runMcpServer();
}
