#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    registryPath: path.join(__dirname, '..', 'registry', 'skill-sources.json'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--id') {
      options.id = argv[index + 1];
      index += 1;
    } else if (arg === '--path') {
      options.path = argv[index + 1];
      index += 1;
    } else if (arg === '--source-dir') {
      options.sourceDir = argv[index + 1];
      index += 1;
    } else if (arg === '--overlay-dir') {
      options.overlayDir = argv[index + 1];
      index += 1;
    } else if (arg === '--prefix') {
      options.prefix = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage: node scripts/add-local-source.js --id <name> --path <dir> [options]

Options:
  --id <name>            Source id written into registry/skill-sources.json
  --path <dir>           Local repo path, relative to starter repo or absolute
  --source-dir <dir>     Skill root inside that repo (default: skills)
  --overlay-dir <dir>    Optional Codex overlay dir inside that repo
  --prefix <value>       Optional installed skill prefix
  --help, -h             Show this help text
`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!options.id || !options.path) {
    throw new Error('Both --id and --path are required');
  }

  const registry = JSON.parse(fs.readFileSync(options.registryPath, 'utf8'));
  const sources = Array.isArray(registry.sources) ? registry.sources : [];
  const existingIndex = sources.findIndex(source => source.id === options.id);
  const nextSource = {
    id: options.id,
    type: 'local',
    path: options.path,
    source_dir: options.sourceDir || 'skills',
  };

  if (options.overlayDir) {
    nextSource.overlay_dir = options.overlayDir;
  }
  if (options.prefix) {
    nextSource.prefix = options.prefix;
  }

  if (existingIndex >= 0) {
    sources[existingIndex] = nextSource;
  } else {
    sources.push(nextSource);
  }

  registry.sources = sources;
  fs.writeFileSync(options.registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`Updated ${options.registryPath} with local source "${options.id}"`);
}

main();
