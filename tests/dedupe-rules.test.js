const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { installSkills } = require('../scripts/lib/skill-sync');

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

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function makeSkill(rootDir, skillName) {
  writeFile(path.join(rootDir, skillName, 'SKILL.md'), [
    '---',
    `name: ${skillName}`,
    `description: ${skillName} description`,
    '---',
    '',
    `# ${skillName}`,
    '',
  ].join('\n'));
}

let passed = 0;
let failed = 0;

if (test('same-name skill from lower-priority source is skipped', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-helper-dedupe-'));
  try {
    const sourceA = path.join(tempRoot, 'source-a', 'skills');
    const sourceB = path.join(tempRoot, 'source-b', 'skills');
    const codexHome = path.join(tempRoot, 'home');

    makeSkill(sourceA, 'coding-standards');
    makeSkill(sourceB, 'coding-standards');

    writeFile(path.join(tempRoot, 'registry', 'skill-sources.json'), JSON.stringify({
      version: 1,
      sources: [
        { id: 'main', type: 'local', path: 'source-a', source_dir: 'skills' },
        { id: 'secondary', type: 'local', path: 'source-b', source_dir: 'skills' },
      ],
    }, null, 2));

    writeFile(path.join(tempRoot, 'registry', 'dedupe-rules.json'), JSON.stringify({
      version: 1,
      groups: [],
    }, null, 2));

    const report = installSkills({
      repoRoot: tempRoot,
      codexHome,
    });

    assert.deepStrictEqual(report.installedSkills, ['coding-standards']);
    assert.strictEqual(report.skippedSkills.length, 1);
    assert.strictEqual(report.skippedSkills[0].sourceId, 'secondary');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
})) passed++; else failed++;

if (test('duplicate-function skill from lower-priority source is skipped by dedupe rule', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-helper-dedupe-'));
  try {
    const sourceA = path.join(tempRoot, 'source-a', 'skills');
    const sourceB = path.join(tempRoot, 'source-b', 'skills');
    const codexHome = path.join(tempRoot, 'home');

    makeSkill(sourceA, 'tdd-workflow');
    makeSkill(sourceB, 'test-driven-development');

    writeFile(path.join(tempRoot, 'registry', 'skill-sources.json'), JSON.stringify({
      version: 1,
      sources: [
        { id: 'main', type: 'local', path: 'source-a', source_dir: 'skills' },
        { id: 'secondary', type: 'local', path: 'source-b', source_dir: 'skills' },
      ],
    }, null, 2));

    writeFile(path.join(tempRoot, 'registry', 'dedupe-rules.json'), JSON.stringify({
      version: 1,
      groups: [
        {
          id: 'tdd-workflow',
          aliases: ['tdd-workflow', 'test-driven-development'],
        },
      ],
    }, null, 2));

    const report = installSkills({
      repoRoot: tempRoot,
      codexHome,
    });

    assert.deepStrictEqual(report.installedSkills, ['tdd-workflow']);
    assert.strictEqual(report.skippedSkills.length, 1);
    assert.strictEqual(report.skippedSkills[0].skillName, 'test-driven-development');
    assert.strictEqual(report.skippedSkills[0].key, 'group:tdd-workflow');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
})) passed++; else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
