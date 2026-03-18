const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { INSTALLER_MANIFEST, installSkills } = require('../scripts/lib/skill-sync');

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

let passed = 0;
let failed = 0;

if (test('manifest stores installer repo root for future updates', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-helper-manifest-'));
  try {
    const codexHome = path.join(tempRoot, 'home');
    const repoRoot = path.join(tempRoot, 'repo');

    writeFile(path.join(repoRoot, 'skills', 'example-skill', 'SKILL.md'), [
      '---',
      'name: example-skill',
      'description: example skill',
      '---',
      '',
      '# Example Skill',
      '',
    ].join('\n'));

    writeFile(path.join(repoRoot, 'registry', 'skill-sources.json'), JSON.stringify({
      version: 1,
      sources: [
        { id: 'local', type: 'local', path: '.', source_dir: 'skills' },
      ],
    }, null, 2));

    writeFile(path.join(repoRoot, 'registry', 'dedupe-rules.json'), JSON.stringify({
      version: 1,
      groups: [],
    }, null, 2));

    installSkills({ repoRoot, codexHome });

    const manifestPath = path.join(codexHome, 'skills', INSTALLER_MANIFEST);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(manifest.installerRepoRoot, repoRoot);
    assert.deepStrictEqual(manifest.installedSkills, ['example-skill']);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
})) passed++; else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
