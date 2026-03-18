#!/usr/bin/env node

const path = require('path');
const { downloadRecommendedRepos } = require('./download-recommended');
const { installSkills } = require('./lib/skill-sync');
const { installStartupSnippet } = require('./install-startup-snippet');
const { printInstallReport } = require('./lib/install-report');

function main() {
  const repoRoot = path.join(__dirname, '..');
  const downloadReport = downloadRecommendedRepos({ repoRoot });
  const installReport = installSkills({ repoRoot });
  const startupReport = installStartupSnippet({ repoRoot });

  console.log(`Updated ${downloadReport.count} recommended repo(s).`);
  printInstallReport(installReport);
  console.log(`Refreshed startup instructions at ${startupReport.agentsPath}`);
}

if (require.main === module) {
  main();
}
