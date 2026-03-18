#!/usr/bin/env node

const path = require('path');
const { installSkills } = require('./lib/skill-sync');
const { installStartupSnippet } = require('./install-startup-snippet');
const { printInstallReport } = require('./lib/install-report');

function main() {
  const repoRoot = path.join(__dirname, '..');
  const installReport = installSkills({ repoRoot });
  const startupReport = installStartupSnippet({ repoRoot });

  printInstallReport(installReport);
  console.log(`Updated startup instructions at ${startupReport.agentsPath}`);
}

if (require.main === module) {
  main();
}
