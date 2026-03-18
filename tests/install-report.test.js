const assert = require('assert');

const { formatSkippedItem } = require('../scripts/lib/install-report');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

if (test('formats skipped duplicate output with kept source details', () => {
  const line = formatSkippedItem({
    installedName: 'test-driven-development',
    sourceId: 'secondary',
    skippedBecauseOf: {
      installedName: 'tdd-workflow',
      sourceId: 'main',
    },
  });

  assert.ok(line.includes('test-driven-development from secondary skipped'));
  assert.ok(line.includes('kept tdd-workflow from main'));
})) passed++; else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
