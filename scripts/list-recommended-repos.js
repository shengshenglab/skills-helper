#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {
  const filePath = path.join(__dirname, '..', 'registry', 'recommended-repos.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const repos = Array.isArray(data.recommended) ? data.recommended : [];

  console.log('Recommended upstream skill repos:\n');
  for (const repo of repos) {
    console.log(`- ${repo.name}`);
    console.log(`  id: ${repo.id}`);
    console.log(`  repo: ${repo.repo}`);
    console.log(`  source_dir: ${repo.source_dir || 'skills'}`);
    if (repo.overlay_dir) {
      console.log(`  overlay_dir: ${repo.overlay_dir}`);
    }
    if (repo.notes) {
      console.log(`  notes: ${repo.notes}`);
    }
    console.log('');
  }
}

main();
