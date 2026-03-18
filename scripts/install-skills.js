#!/usr/bin/env node

const path = require('path');
const { installSkills } = require('./lib/skill-sync');
const { printInstallReport } = require('./lib/install-report');

function main() {
  const report = installSkills({
    repoRoot: path.join(__dirname, '..'),
  });

  printInstallReport(report);
}

main();
