import {
  escapeCsvCell,
  generateFileInventoryCsv,
  generateClientHandoffCsv,
  extractInventoryRows,
  extractClientHandoffRows,
} from '../src/lib/export/csvExporter';
import { generateExcelWorkbook } from '../src/lib/export/excelExporter';
import { RepositoryAnalysisResult } from '../src/lib/types';
import * as XLSX from 'xlsx';

export async function runExportUtilitySuite() {
  console.log('\n========================================================================');
  console.log('🧪 Phase 8: Excel (.xlsx) & CSV Export Engine Test Suite');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: CSV Escaping & Formula Injection Shielding
  // -------------------------------------------------------------------------
  console.log('[TEST 1] Testing CSV cell escaping, quotes doubling, and formula injection guard...');
  
  const simpleCell = escapeCsvCell('standard text');
  if (simpleCell !== '"standard text"') {
    throw new Error(`Expected '"standard text"', got: ${simpleCell}`);
  }

  const commaCell = escapeCsvCell('Next.js, React, Tailwind');
  if (commaCell !== '"Next.js, React, Tailwind"') {
    throw new Error(`Expected comma cell to be wrapped in quotes, got: ${commaCell}`);
  }

  const quoteCell = escapeCsvCell('He said "Ship It" immediately');
  if (quoteCell !== '"He said ""Ship It"" immediately"') {
    throw new Error(`Expected inner quotes to be doubled, got: ${quoteCell}`);
  }

  const multilineCell = escapeCsvCell("Line 1\nLine 2\r\nLine 3");
  if (!multilineCell.includes('Line 1\nLine 2')) {
    throw new Error(`Expected multiline cell to preserve line breaks, got: ${multilineCell}`);
  }

  const formulaCell = escapeCsvCell('=cmd|"/c calc"!A1');
  if (!formulaCell.includes("'=")) {
    throw new Error(`Expected formula injection protection prefixing with single quote, got: ${formulaCell}`);
  }

  const nullCell = escapeCsvCell(null);
  const undefinedCell = escapeCsvCell(undefined);
  if (nullCell !== '""' || undefinedCell !== '""') {
    throw new Error(`Expected empty quoted string for null/undefined, got: ${nullCell}`);
  }

  console.log('✅ PASS: RFC 4180 CSV escaping and formula injection protection verified.');

  // -------------------------------------------------------------------------
  // TEST 2: File Inventory CSV Generation & AST Categorization
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Testing File Inventory CSV generation and AST classification...');
  
  const mockResult: RepositoryAnalysisResult = {
    repoUrl: 'https://github.com/facebook/react',
    owner: 'facebook',
    repo: 'react',
    defaultBranch: 'main',
    fileTreeSummary: [
      '[FILE] src/app/layout.tsx (8.4 KB)',
      '[FILE] src/components/HeroSection.tsx (18.2 KB)',
      '[FILE] src/lib/actions.ts (12.1 KB)',
      '[FILE] .env.production (1.0 KB)',
      '[DIR] src/components',
    ].join('\n'),
    contextMarkdown: '# React Repository\nHigh performance UI library.',
    mermaidArchitecture: 'graph TD; A-->B;',
    analyzedAt: '2026-09-12T12:00:00.000Z',
    licenseSpdx: 'MIT',
    vulnerabilityCount: 0,
    criticalVulnerabilityCount: 0,
    monetizableOutputs: {
      framework: 'Next.js',
      onboarding: {
        claudeMd: '# CLAUDE.md\nEnforce strict TypeScript.',
        agentsMd: '# AGENTS.md\nMulti-agent coordination protocol.',
        devCommands: ['npm run dev', 'npm test'],
        stylingStandards: 'Tailwind CSS',
        componentRules: 'Modular functional components',
      },
      cursorRules: [
        {
          filename: '.cursor/rules/nextjs.mdc',
          content: '---\ndescription: Next.js App Router\nglobs: src/app/**/*.tsx\nalwaysApply: true\n---\nRules content',
          framework: 'Next.js',
        },
      ],
      architecture: {
        mermaidGraph: 'graph TD; A-->B;',
        flowchartNodes: [{ id: 'node_1', label: 'App Layout', type: 'page' }],
      },
      clientHandoffReport: {
        title: 'Release Overview',
        summary: 'Technical architecture updates and multi-agent onboarding specs.',
        categories: {
          newFeatures: ['Automated AST scanning', 'Direct-to-AI prompt generation'],
          securityMaintenance: ['Redacted API keys and secrets'],
          userExperience: ['Added interactive Mermaid dependency flowchart'],
        },
        markdown: '',
      },
    },
  };

  const inventoryRows = extractInventoryRows(mockResult);
  if (inventoryRows.length !== 5) {
    throw new Error(`Expected 5 inventory rows, got: ${inventoryRows.length}`);
  }

  const envFile = inventoryRows.find(r => r.filePath.includes('.env.production'));
  if (!envFile || envFile.sanitizationTriggered !== 'Yes') {
    throw new Error('Expected .env.production to trigger sanitization flag');
  }

  const layoutFile = inventoryRows.find(r => r.filePath.includes('layout.tsx'));
  if (!layoutFile || layoutFile.componentCategory !== 'Page Route / Layout') {
    throw new Error(`Expected layout.tsx category to be Page Route / Layout, got: ${layoutFile?.componentCategory}`);
  }

  const invCsv = generateFileInventoryCsv(mockResult);
  if (!invCsv.includes('File Path') || !invCsv.includes('File Type') || !invCsv.includes('Component Category')) {
    throw new Error('CSV missing required inventory headers');
  }
  if (!invCsv.includes('src/components/HeroSection.tsx')) {
    throw new Error('CSV missing HeroSection row');
  }

  console.log('✅ PASS: File Inventory CSV generated with correct AST categories and sanitization flags.');

  // -------------------------------------------------------------------------
  // TEST 3: Client Handoff CSV Generation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Testing Client Handoff CSV generation & category grouping...');

  const handoffRows = extractClientHandoffRows(mockResult);
  if (handoffRows.length !== 4) {
    throw new Error(`Expected 4 client handoff items, got: ${handoffRows.length}`);
  }

  const handoffCsv = generateClientHandoffCsv(mockResult);
  if (!handoffCsv.includes('Category') || !handoffCsv.includes('Summary / Feature Description') || !handoffCsv.includes('Impact / Business Value')) {
    throw new Error('CSV missing client handoff headers');
  }
  if (!handoffCsv.includes('New Features Completed') || !handoffCsv.includes('Security & Maintenance')) {
    throw new Error('CSV missing grouped categories');
  }

  console.log('✅ PASS: Client Handoff CSV correctly generated with 3-category groupings.');

  // -------------------------------------------------------------------------
  // TEST 4: Excel (.xlsx) Multi-Sheet Workbook Generation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing Excel (.xlsx) 4-sheet binary workbook generation...');

  const excelBuffer = generateExcelWorkbook(mockResult);
  if (!(excelBuffer instanceof Uint8Array) || excelBuffer.byteLength === 0) {
    throw new Error('Expected non-empty Uint8Array binary buffer for Excel workbook');
  }

  // Parse workbook using SheetJS to verify sheets and cells
  const wb = XLSX.read(excelBuffer, { type: 'buffer' });
  const expectedSheets = [
    'Overview & Metadata',
    'Codebase Inventory & AST',
    'Generated AI Rules',
    'Client Handoff Report',
  ];

  for (const sheetName of expectedSheets) {
    if (!wb.SheetNames.includes(sheetName)) {
      throw new Error(`Missing expected sheet "${sheetName}" in generated workbook. Available: ${wb.SheetNames.join(', ')}`);
    }
  }

  // Verify Sheet 1 contents
  const overviewSheet = wb.Sheets['Overview & Metadata'];
  const overviewData = XLSX.utils.sheet_to_json<any>(overviewSheet, { header: 1 });
  const propRows = overviewData.map((row: any) => row[0]);
  if (!propRows.includes('Repository Name') || !propRows.includes('GitHub URL') || !propRows.includes('Primary Framework Detected')) {
    throw new Error('Sheet 1 missing key metadata property rows');
  }

  // Verify Sheet 3 contents (AI Rules)
  const rulesSheet = wb.Sheets['Generated AI Rules'];
  const rulesData = XLSX.utils.sheet_to_json<any>(rulesSheet, { header: 1 });
  const ruleFiles = rulesData.map((row: any) => row[0]);
  if (!ruleFiles.includes('CLAUDE.md') || !ruleFiles.includes('AGENTS.md') || !ruleFiles.includes('.cursor/rules/nextjs.mdc')) {
    throw new Error(`Sheet 3 missing required rule files. Found: ${ruleFiles.join(', ')}`);
  }

  console.log(`✅ PASS: Excel workbook validated with all 4 sheets (${excelBuffer.byteLength} bytes).`);

  // -------------------------------------------------------------------------
  // TEST 5: Graceful Handling of Empty / Edge-Case Inputs
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5] Testing graceful degradation on partial/empty analysis payloads...');

  const minimalResult: RepositoryAnalysisResult = {
    repoUrl: '',
    owner: 'acme',
    repo: 'minimal-repo',
    defaultBranch: 'main',
    fileTreeSummary: '',
    contextMarkdown: '',
    mermaidArchitecture: '',
    analyzedAt: '',
  };

  const minimalWbBuffer = generateExcelWorkbook(minimalResult);
  if (!(minimalWbBuffer instanceof Uint8Array) || minimalWbBuffer.byteLength === 0) {
    throw new Error('Failed to generate Excel workbook for minimal repository result');
  }

  const minimalInvCsv = generateFileInventoryCsv(minimalResult);
  if (!minimalInvCsv.includes('File Path') || !minimalInvCsv.includes('File Type')) {
    throw new Error('Failed to generate Inventory CSV for minimal repository result');
  }

  const minimalHandoffCsv = generateClientHandoffCsv(minimalResult);
  if (!minimalHandoffCsv.includes('Category') || !minimalHandoffCsv.includes('Summary / Feature Description')) {
    throw new Error('Failed to generate Handoff CSV for minimal repository result');
  }

  console.log('✅ PASS: Handled null and empty analysis sections cleanly without throwing.');

  console.log('\n========================================================================');
  console.log('🎉 PHASE 8: EXCEL & CSV EXPORT UTILITY SUITE PASSED 100% (5/5 ASSERTIONS)');
  console.log('========================================================================\n');
}

// Allow direct execution
if (require.main === module) {
  runExportUtilitySuite().catch(err => {
    console.error('❌ Phase 8 Export Utility Test Suite Failed:', err);
    process.exit(1);
  });
}
