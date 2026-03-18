#!/usr/bin/env node

const { downloadRecommendedRepos } = require('./download-recommended');
const { installSkills } = require('./lib/skill-sync');
const { installStartupSnippet } = require('./install-startup-snippet');
const { printInstallReport } = require('./lib/install-report');

function main() {
  const downloadReport = downloadRecommendedRepos();
  const installReport = installSkills();
  const startupReport = installStartupSnippet();

  console.log(`Downloaded ${downloadReport.count} recommended repo(s)`);
  printInstallReport(installReport);
  console.log(`Updated startup instructions at ${startupReport.agentsPath}`);
}

if (require.main === module) {
  main();
}
