#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { uninstallManagedSkills } = require('./lib/skill-sync');
const { removeStartupSnippet } = require('./install-startup-snippet');

function main() {
  const codexHome = path.join(os.homedir(), '.codex');
  const uninstallReport = uninstallManagedSkills({ codexHome });
  const startupReport = removeStartupSnippet({ codexHome });

  console.log(`Removed ${uninstallReport.removedSkills.length} managed skills from ${uninstallReport.destinationRoot}`);
  console.log(`Removed installer manifest: ${uninstallReport.removedManifest ? 'yes' : 'no'}`);
  console.log(`Removed startup recommendation: ${startupReport.removed ? 'yes' : 'no'}`);
  console.log(`AGENTS path: ${startupReport.agentsPath}`);
}

if (require.main === module) {
  main();
}
