#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function upsertSource(sources, nextSource) {
  const index = sources.findIndex(source => source.id === nextSource.id);
  if (index >= 0) {
    sources[index] = nextSource;
    return;
  }
  sources.push(nextSource);
}

function syncRepo(targetDir, repo, ref) {
  if (!fs.existsSync(targetDir)) {
    execFileSync('git', ['clone', '--depth', '1', repo, targetDir], { stdio: 'inherit' });
  } else {
    execFileSync('git', ['-C', targetDir, 'fetch', '--depth', '1', 'origin', ref || 'main'], { stdio: 'inherit' });
    execFileSync('git', ['-C', targetDir, 'checkout', '--force', 'FETCH_HEAD'], { stdio: 'inherit' });
    return;
  }

  if (ref && ref !== 'main') {
    execFileSync('git', ['-C', targetDir, 'fetch', '--depth', '1', 'origin', ref], { stdio: 'inherit' });
    execFileSync('git', ['-C', targetDir, 'checkout', '--force', 'FETCH_HEAD'], { stdio: 'inherit' });
  }
}

function downloadRecommendedRepos(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || path.join(__dirname, '..'));
  const recommendedPath = path.join(repoRoot, 'registry', 'recommended-repos.json');
  const registryPath = path.join(repoRoot, 'registry', 'skill-sources.json');
  const subreposDir = ensureDir(path.join(repoRoot, 'subrepos'));
  const recommended = readJson(recommendedPath).recommended || [];
  const registry = readJson(registryPath);
  const sources = Array.isArray(registry.sources) ? registry.sources : [];

  for (const repo of recommended) {
    const targetDir = path.join(subreposDir, repo.id);
    syncRepo(targetDir, repo.repo, repo.ref || 'main');

    upsertSource(sources, {
      id: repo.id,
      type: 'local',
      path: path.relative(repoRoot, targetDir),
      source_dir: repo.source_dir || 'skills',
      overlay_dir: repo.overlay_dir,
      prefix: repo.prefix,
    });
  }

  registry.sources = sources;
  writeJson(registryPath, registry);

  return {
    repoRoot,
    count: recommended.length,
  };
}

function main() {
  const report = downloadRecommendedRepos();
  console.log(`Downloaded and registered ${report.count} recommended repo(s).`);
}

if (require.main === module) {
  main();
}

module.exports = {
  downloadRecommendedRepos,
};
