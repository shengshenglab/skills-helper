function formatSkippedItem(item) {
  const reason = item.skippedBecauseOf
    ? `${item.skippedBecauseOf.installedName} from ${item.skippedBecauseOf.sourceId}`
    : 'a higher-priority skill';
  return `- ${item.installedName} from ${item.sourceId} skipped; kept ${reason}`;
}

function printInstallReport(report) {
  console.log(`Installed ${report.installedSkills.length} skills from ${report.sourceCount} source(s).`);
  console.log(`Destination: ${report.destinationRoot}`);

  if (report.skippedSkills.length === 0) {
    console.log('Skipped duplicates: 0');
    return;
  }

  console.log(`Skipped duplicates: ${report.skippedSkills.length}`);
  const preview = report.skippedSkills.slice(0, 15);
  for (const item of preview) {
    console.log(formatSkippedItem(item));
  }

  const remaining = report.skippedSkills.length - preview.length;
  if (remaining > 0) {
    console.log(`- ...and ${remaining} more skipped duplicates`);
  }
}

module.exports = {
  formatSkippedItem,
  printInstallReport,
};
