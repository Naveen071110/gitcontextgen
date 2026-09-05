import * as fs from 'fs';
import * as path from 'path';
import { analyzeLocalDirectory } from '../localScanner.js';
import { analyzeRemoteGitHubRepo, isGitHubUrl } from '../remoteScanner.js';
import { generateArchitecture } from '../architectureEngine.js';
export async function executeMap(targetPath, options = {}) {
    const resolvedPath = targetPath ? targetPath.trim() : process.cwd();
    const style = options.style || 'layered';
    let analysis;
    if (isGitHubUrl(resolvedPath)) {
        analysis = await analyzeRemoteGitHubRepo(resolvedPath);
    }
    else {
        analysis = await analyzeLocalDirectory(resolvedPath);
    }
    const archResult = generateArchitecture(analysis, style);
    if (options.output) {
        const outPath = path.resolve(options.output);
        const parentDir = path.dirname(outPath);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.writeFileSync(outPath, archResult.diagram, 'utf-8');
        console.log(`✅ Architecture diagram successfully written to: ${outPath}`);
    }
    else {
        console.log('\n' + '='.repeat(72));
        console.log(`🗺️  Architecture Map (${style}): ${analysis.name}`);
        console.log('='.repeat(72) + '\n');
        console.log(archResult.diagram);
        console.log('\n' + '-'.repeat(72));
        console.log('🌐 Serverless Kroki Export Links:');
        console.log(`   - SVG: ${archResult.kroki.svgUrl}`);
        console.log(`   - PNG: ${archResult.kroki.pngUrl}`);
        console.log('-'.repeat(72) + '\n');
    }
}
