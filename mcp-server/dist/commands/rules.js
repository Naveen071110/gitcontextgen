import * as fs from 'fs';
import * as path from 'path';
import { analyzeLocalDirectory } from '../localScanner.js';
import { analyzeRemoteGitHubRepo, isGitHubUrl } from '../remoteScanner.js';
import { generateRules } from '../rulesEngine.js';
export async function executeRules(targetPath, options = {}) {
    const resolvedPath = targetPath ? targetPath.trim() : process.cwd();
    const rawFormat = (options.format || 'claude').toLowerCase();
    const validFormats = ['claude', 'cursor', 'copilot', 'windsurf', 'universal', 'agents', 'agent_readme', 'wordpress'];
    if (!validFormats.includes(rawFormat)) {
        console.error(`❌ Invalid format: "${rawFormat}". Allowed formats: ${validFormats.join(', ')}`);
        process.exit(1);
    }
    const format = rawFormat;
    let analysis;
    if (isGitHubUrl(resolvedPath)) {
        analysis = await analyzeRemoteGitHubRepo(resolvedPath);
    }
    else {
        analysis = await analyzeLocalDirectory(resolvedPath);
    }
    const { filename, content } = generateRules(analysis, format);
    if (options.output) {
        const outPath = path.resolve(options.output);
        const parentDir = path.dirname(outPath);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.writeFileSync(outPath, content, 'utf-8');
        console.log(`✅ Rules successfully written to: ${outPath}`);
    }
    else {
        console.log(content);
    }
}
