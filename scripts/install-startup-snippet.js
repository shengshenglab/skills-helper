#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const START_MARKER = '<!-- skills-helper:start -->';
const END_MARKER = '<!-- skills-helper:end -->';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function loadSnippet(repoRoot) {
  return fs.readFileSync(path.join(repoRoot, 'templates', 'codex-startup-snippet.md'), 'utf8').trim();
}

function updateManagedBlock(existingContent, blockContent) {
  const managedBlock = `${START_MARKER}\n${blockContent}\n${END_MARKER}`;

  if (existingContent.includes(START_MARKER) && existingContent.includes(END_MARKER)) {
    const pattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'm');
    return existingContent.replace(pattern, managedBlock);
  }

  if (!existingContent.trim()) {
    return `${managedBlock}\n`;
  }

  return `${existingContent.trim()}\n\n${managedBlock}\n`;
}

function removeManagedBlock(existingContent) {
  if (!existingContent.includes(START_MARKER) || !existingContent.includes(END_MARKER)) {
    return existingContent;
  }

  const pattern = new RegExp(`\\n*${START_MARKER}[\\s\\S]*?${END_MARKER}\\n*`, 'm');
  const next = existingContent.replace(pattern, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return next ? `${next}\n` : '';
}

function installStartupSnippet(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || path.join(__dirname, '..'));
  const codexHome = path.resolve(options.codexHome || path.join(os.homedir(), '.codex'));
  const agentsPath = path.join(codexHome, 'AGENTS.md');
  const snippet = loadSnippet(repoRoot);

  ensureDir(codexHome);
  const existing = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';
  const next = updateManagedBlock(existing, snippet);
  fs.writeFileSync(agentsPath, next);

  return { agentsPath };
}

function removeStartupSnippet(options = {}) {
  const codexHome = path.resolve(options.codexHome || path.join(os.homedir(), '.codex'));
  const agentsPath = path.join(codexHome, 'AGENTS.md');

  if (!fs.existsSync(agentsPath)) {
    return { agentsPath, removed: false };
  }

  const existing = fs.readFileSync(agentsPath, 'utf8');
  const next = removeManagedBlock(existing);
  fs.writeFileSync(agentsPath, next);

  return { agentsPath, removed: existing !== next };
}

function main() {
  const report = installStartupSnippet();
  console.log(`Updated ${report.agentsPath}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  installStartupSnippet,
  removeStartupSnippet,
  removeManagedBlock,
  updateManagedBlock,
};
