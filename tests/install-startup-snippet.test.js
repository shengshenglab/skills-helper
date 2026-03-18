const assert = require('assert');

const { removeManagedBlock, updateManagedBlock } = require('../scripts/install-startup-snippet');

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

if (test('appends a managed block when AGENTS is empty', () => {
  const result = updateManagedBlock('', 'hello');
  assert.ok(result.includes('hello'));
  assert.ok(result.includes('skills-helper:start'));
})) passed++; else failed++;

if (test('replaces an existing managed block without duplicating it', () => {
  const original = [
    'before',
    '<!-- skills-helper:start -->',
    'old',
    '<!-- skills-helper:end -->',
    'after',
  ].join('\n');

  const result = updateManagedBlock(original, 'new');
  assert.ok(result.includes('new'));
  assert.ok(!result.includes('\nold\n'));
  assert.strictEqual((result.match(/skills-helper:start/g) || []).length, 1);
})) passed++; else failed++;

if (test('removes an existing managed block while keeping surrounding content', () => {
  const original = [
    'before',
    '<!-- skills-helper:start -->',
    'managed',
    '<!-- skills-helper:end -->',
    'after',
  ].join('\n');

  const result = removeManagedBlock(original);
  assert.ok(result.includes('before'));
  assert.ok(result.includes('after'));
  assert.ok(!result.includes('managed'));
  assert.ok(!result.includes('skills-helper:start'));
})) passed++; else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
