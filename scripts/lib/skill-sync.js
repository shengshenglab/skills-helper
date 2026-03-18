const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const INSTALLER_MANIFEST = '.skills-helper.json';
const DEFAULT_COLORS = Object.freeze([
  '#2563EB',
  '#0F766E',
  '#CA8A04',
  '#DC2626',
  '#7C3AED',
  '#0891B2',
  '#059669',
  '#4F46E5',
]);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function listSkillNames(rootDir) {
  if (!rootDir || !fs.existsSync(rootDir)) {
    return [];
  }

  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => fs.existsSync(path.join(rootDir, name, 'SKILL.md')))
    .sort();
}

function normalizeSkillKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[_\s]+/g, '-');
}

function loadDedupeRules(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { groups: [] };
  }

  const rules = readJson(filePath);
  const groups = Array.isArray(rules.groups) ? rules.groups : [];
  const aliasToGroup = new Map();

  for (const group of groups) {
    const aliases = Array.isArray(group.aliases) ? group.aliases : [];
    for (const alias of aliases) {
      aliasToGroup.set(normalizeSkillKey(alias), group.id);
    }
  }

  return {
    ...rules,
    aliasToGroup,
  };
}

function copyDirRecursive(sourceDir, destDir) {
  ensureDir(destDir);
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, destPath);
    } else if (entry.isFile()) {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {};
  }

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    fields[key] = value;
  }

  return fields;
}

function toDisplayName(skillName) {
  return skillName
    .split(/[-_]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toYamlString(value) {
  return JSON.stringify(String(value));
}

function colorForSkill(skillName) {
  let hash = 0;
  for (const char of skillName) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash |= 0;
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

function buildOpenAiYaml(skillName, markdown) {
  const frontmatter = parseFrontmatter(markdown);
  const description = frontmatter.description || `Use the ${skillName} skill`;

  return [
    'interface:',
    `  display_name: ${toYamlString(toDisplayName(skillName))}`,
    `  short_description: ${toYamlString(description)}`,
    `  brand_color: ${toYamlString(colorForSkill(skillName))}`,
    `  default_prompt: ${toYamlString(`Use the ${skillName} skill: ${description}`)}`,
    'policy:',
    '  allow_implicit_invocation: true',
    '',
  ].join('\n');
}

function resolveSourceRoot(repoRoot, source) {
  if (source.type === 'local') {
    return path.resolve(repoRoot, source.path || '.');
  }

  const cacheRoot = ensureDir(path.join(os.homedir(), '.codex-skill-installer', 'sources'));
  const repoCacheDir = path.join(cacheRoot, source.id);
  const ref = source.ref || 'main';

  if (!fs.existsSync(repoCacheDir)) {
    execFileSync('git', ['clone', '--depth', '1', '--branch', ref, '--single-branch', source.repo, repoCacheDir], { stdio: 'inherit' });
    return repoCacheDir;
  }

  execFileSync('git', ['-C', repoCacheDir, 'fetch', '--depth', '1', 'origin', ref], { stdio: 'inherit' });
  execFileSync('git', ['-C', repoCacheDir, 'checkout', '--force', 'FETCH_HEAD'], { stdio: 'inherit' });
  return repoCacheDir;
}

function filterSkillNames(skillNames, source) {
  const include = new Set(Array.isArray(source.include) ? source.include : []);
  const exclude = new Set(Array.isArray(source.exclude) ? source.exclude : []);

  return skillNames.filter(skillName => {
    if (include.size > 0 && !include.has(skillName)) {
      return false;
    }
    if (exclude.has(skillName)) {
      return false;
    }
    return true;
  });
}

function buildCandidateKeys(skillName, dedupeRules) {
  const normalized = normalizeSkillKey(skillName);
  const keys = [`name:${normalized}`];
  const groupId = dedupeRules.aliasToGroup instanceof Map
    ? dedupeRules.aliasToGroup.get(normalized)
    : null;

  if (groupId) {
    keys.push(`group:${groupId}`);
  }

  return keys;
}

function installSkills(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const registryPath = path.resolve(options.registryPath || path.join(repoRoot, 'registry', 'skill-sources.json'));
  const dedupeRulesPath = path.resolve(options.dedupeRulesPath || path.join(repoRoot, 'registry', 'dedupe-rules.json'));
  const codexHome = path.resolve(options.codexHome || path.join(os.homedir(), '.codex'));
  const destinationRoot = ensureDir(path.join(codexHome, 'skills'));
  const manifestPath = path.join(destinationRoot, INSTALLER_MANIFEST);
  const registry = readJson(registryPath);
  const dedupeRules = loadDedupeRules(dedupeRulesPath);
  const sources = Array.isArray(registry.sources) ? registry.sources.filter(source => source.enabled !== false) : [];
  const previousManifest = fs.existsSync(manifestPath) ? readJson(manifestPath) : null;
  const previousInstalled = new Set(Array.isArray(previousManifest?.installedSkills) ? previousManifest.installedSkills : []);
  const installedSkills = [];
  const selectedKeys = new Map();
  const skippedSkills = [];

  for (const source of sources) {
    const sourceRoot = resolveSourceRoot(repoRoot, source);
    const sourceDir = path.join(sourceRoot, source.source_dir || 'skills');
    const overlayDir = source.overlay_dir ? path.join(sourceRoot, source.overlay_dir) : null;
    const skillNames = filterSkillNames(listSkillNames(sourceDir), source);

    for (const skillName of skillNames) {
      const installedName = source.prefix ? `${source.prefix}${skillName}` : skillName;
      const candidateKeys = buildCandidateKeys(skillName, dedupeRules);
      const duplicateKey = candidateKeys.find(key => selectedKeys.has(key));

      if (duplicateKey && source.allowDuplicates !== true) {
        const selected = selectedKeys.get(duplicateKey);
        skippedSkills.push({
          skillName,
          installedName,
          sourceId: source.id,
          skippedBecauseOf: selected,
          key: duplicateKey,
        });
        continue;
      }

      for (const key of candidateKeys) {
        selectedKeys.set(key, {
          sourceId: source.id,
          skillName,
          installedName,
        });
      }

      const sourceSkillDir = path.join(sourceDir, skillName);
      const overlaySkillDir = overlayDir ? path.join(overlayDir, skillName) : null;
      const destinationSkillDir = path.join(destinationRoot, installedName);

      fs.rmSync(destinationSkillDir, { recursive: true, force: true });
      copyDirRecursive(sourceSkillDir, destinationSkillDir);

      if (overlaySkillDir && fs.existsSync(overlaySkillDir)) {
        copyDirRecursive(overlaySkillDir, destinationSkillDir);
      }

      const openAiYamlPath = path.join(destinationSkillDir, 'agents', 'openai.yaml');
      if (!fs.existsSync(openAiYamlPath)) {
        const markdown = fs.readFileSync(path.join(destinationSkillDir, 'SKILL.md'), 'utf8');
        ensureDir(path.dirname(openAiYamlPath));
        fs.writeFileSync(openAiYamlPath, buildOpenAiYaml(installedName, markdown));
      }

      installedSkills.push(installedName);
    }
  }

  for (const staleSkill of previousInstalled) {
    if (!installedSkills.includes(staleSkill)) {
      fs.rmSync(path.join(destinationRoot, staleSkill), { recursive: true, force: true });
    }
  }

  writeJson(manifestPath, {
    managedBy: 'skills-helper',
    version: 1,
    installerRepoRoot: repoRoot,
    installedSkills: installedSkills.sort(),
    skippedSkills,
  });

  return {
    destinationRoot,
    installedSkills: installedSkills.sort(),
    skippedSkills,
    sourceCount: sources.length,
  };
}

function uninstallManagedSkills(options = {}) {
  const codexHome = path.resolve(options.codexHome || path.join(os.homedir(), '.codex'));
  const destinationRoot = path.join(codexHome, 'skills');
  const manifestPath = path.join(destinationRoot, INSTALLER_MANIFEST);

  if (!fs.existsSync(manifestPath)) {
    return {
      destinationRoot,
      removedSkills: [],
      removedManifest: false,
    };
  }

  const manifest = readJson(manifestPath);
  const installedSkills = Array.isArray(manifest.installedSkills) ? manifest.installedSkills : [];
  const removedSkills = [];

  for (const skillName of installedSkills) {
    const skillDir = path.join(destinationRoot, skillName);
    if (fs.existsSync(skillDir)) {
      fs.rmSync(skillDir, { recursive: true, force: true });
      removedSkills.push(skillName);
    }
  }

  fs.rmSync(manifestPath, { force: true });

  return {
    destinationRoot,
    removedSkills,
    removedManifest: true,
  };
}

module.exports = {
  INSTALLER_MANIFEST,
  buildOpenAiYaml,
  installSkills,
  listSkillNames,
  uninstallManagedSkills,
};
