const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { recommendSkills, toMarkdown } = require('../scripts/recommend-skills');

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

function withTempProject(setupFn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-helper-'));
  try {
    setupFn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let passed = 0;
let failed = 0;

if (test('recommends Next.js frontend skills for a Next project', () => {
  withTempProject(projectDir => {
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
      dependencies: {
        next: '16.0.0',
        react: '19.0.0',
      },
    }, null, 2));
    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), '{}');
    fs.writeFileSync(path.join(projectDir, 'next.config.ts'), 'export default {};');
    fs.writeFileSync(path.join(projectDir, 'playwright.config.ts'), 'export default {};');

    const report = recommendSkills(projectDir);

    assert.ok(report.alwaysOn.includes('coding-standards'));
    assert.ok(report.taskSpecific.includes('frontend-patterns'));
    assert.ok(report.taskSpecific.includes('nextjs-turbopack'));
    assert.ok(report.taskSpecific.includes('e2e-testing'));
  });
})) passed++; else failed++;

if (test('recommends Django security and verification skills for a Django repo', () => {
  withTempProject(projectDir => {
    fs.writeFileSync(path.join(projectDir, 'requirements.txt'), 'django==5.0.0\n');
    fs.writeFileSync(path.join(projectDir, 'manage.py'), '#!/usr/bin/env python');

    const report = recommendSkills(projectDir);

    assert.ok(report.taskSpecific.includes('python-patterns'));
    assert.ok(report.taskSpecific.includes('django-patterns'));
    assert.ok(report.taskSpecific.includes('django-security'));
    assert.ok(report.taskSpecific.includes('django-verification'));
  });
})) passed++; else failed++;

if (test('includes short descriptions for recommended skills', () => {
  withTempProject(projectDir => {
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
      dependencies: {
        next: '16.0.0',
      },
    }, null, 2));
    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), '{}');
    fs.writeFileSync(path.join(projectDir, 'next.config.ts'), 'export default {};');

    const report = recommendSkills(projectDir);
    const frontendSkill = report.recommendedSkills.find(skill => skill.name === 'frontend-patterns');

    assert.ok(frontendSkill);
    assert.ok(typeof frontendSkill.description === 'string');
    assert.ok(frontendSkill.description.length > 10);
  });
})) passed++; else failed++;

if (test('markdown output asks for activation confirmation', () => {
  withTempProject(projectDir => {
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
      dependencies: {
        next: '16.0.0',
      },
    }, null, 2));
    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), '{}');
    fs.writeFileSync(path.join(projectDir, 'next.config.ts'), 'export default {};');

    const markdown = toMarkdown(recommendSkills(projectDir));

    assert.ok(markdown.includes('Recommended skills:'));
    assert.ok(markdown.includes('Activation:'));
    assert.ok(markdown.includes('Reply to confirm activation'));
  });
})) passed++; else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
