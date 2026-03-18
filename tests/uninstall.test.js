const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { uninstallManagedSkills } = require('../scripts/lib/skill-sync');
const { removeStartupSnippet, updateManagedBlock } = require('../scripts/install-startup-snippet');

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

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

let passed = 0;
let failed = 0;

if (test('uninstalls only managed skills and removes manifest', () => {
  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-helper-uninstall-'));
  try {
    const skillsDir = path.join(tempHome, '.codex', 'skills');
    fs.mkdirSync(path.join(skillsDir, 'managed-one'), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, 'managed-two'), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, 'user-owned'), { recursive: true });

    writeJson(path.join(skillsDir, '.skills-helper.json'), {
      installedSkills: ['managed-one', 'managed-two'],
    });

    const report = uninstallManagedSkills({
      codexHome: path.join(tempHome, '.codex'),
    });

    assert.deepStrictEqual(report.removedSkills.sort(), ['managed-one', 'managed-two']);
    assert.ok(!fs.existsSync(path.join(skillsDir, 'managed-one')));
    assert.ok(!fs.existsSync(path.join(skillsDir, 'managed-two')));
    assert.ok(fs.existsSync(path.join(skillsDir, 'user-owned')));
    assert.ok(!fs.existsSync(path.join(skillsDir, '.skills-helper.json')));
  } finally {
    fs.rmSync(tempHome, { recursive: true, force: true });
  }
})) passed++; else failed++;

if (test('removes startup snippet from AGENTS file', () => {
  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-helper-uninstall-'));
  try {
    const codexHome = path.join(tempHome, '.codex');
    fs.mkdirSync(codexHome, { recursive: true });
    const agentsPath = path.join(codexHome, 'AGENTS.md');
    const content = updateManagedBlock('before\nafter\n', 'managed');
    fs.writeFileSync(agentsPath, content);

    const report = removeStartupSnippet({ codexHome });
    const next = fs.readFileSync(agentsPath, 'utf8');

    assert.strictEqual(report.removed, true);
    assert.ok(next.includes('before'));
    assert.ok(next.includes('after'));
    assert.ok(!next.includes('managed'));
  } finally {
    fs.rmSync(tempHome, { recursive: true, force: true });
  }
})) passed++; else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
