#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ALWAYS_ON = [
  'coding-standards',
  'tdd-workflow',
  'verification-loop',
  'security-review',
  'documentation-lookup',
];

const OPT_IN_ONLY = [
  'deep-research',
  'market-research',
  'exa-search',
  'fal-ai-media',
  'video-editing',
  'dmux-workflows',
  'autonomous-loops',
  'security-scan',
];

const LANGUAGE_RULES = [
  { language: 'python', markers: ['requirements.txt', 'pyproject.toml'], skills: ['python-patterns', 'python-testing'] },
  { language: 'typescript', markers: ['tsconfig.json'], skills: ['frontend-patterns', 'backend-patterns'] },
  { language: 'javascript', markers: ['package.json'], skills: ['frontend-patterns', 'backend-patterns'] },
  { language: 'golang', markers: ['go.mod'], skills: ['golang-patterns', 'golang-testing'] },
  { language: 'rust', markers: ['Cargo.toml'], skills: ['rust-patterns', 'rust-testing'] },
  { language: 'java', markers: ['pom.xml', 'build.gradle', 'build.gradle.kts'], skills: ['java-coding-standards'] },
  { language: 'swift', markers: ['Package.swift'], skills: ['swiftui-patterns'] },
  { language: 'php', markers: ['composer.json'], skills: ['laravel-patterns'] },
];

const FRAMEWORK_RULES = [
  { framework: 'nextjs', markers: ['next.config.js', 'next.config.mjs', 'next.config.ts'], skills: ['frontend-patterns', 'nextjs-turbopack', 'e2e-testing'] },
  { framework: 'django', markers: ['manage.py'], skills: ['django-patterns', 'django-security', 'django-verification'] },
  { framework: 'laravel', markers: ['artisan'], skills: ['laravel-patterns', 'laravel-security', 'laravel-verification'] },
  { framework: 'springboot', markers: ['pom.xml', 'build.gradle', 'build.gradle.kts'], packageHints: ['spring-boot', 'org.springframework'], skills: ['springboot-patterns', 'springboot-security', 'springboot-verification'] },
  { framework: 'docker', markers: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'], skills: ['docker-patterns', 'deployment-patterns'] },
  { framework: 'mcp', markers: ['mcp.json'], skills: ['mcp-server-patterns'] },
  { framework: 'playwright', markers: ['playwright.config.ts', 'playwright.config.js'], skills: ['e2e-testing'] },
];

const SKILL_DESCRIPTIONS = {
  'api-design': 'Design REST-style APIs, resource shapes, filtering, pagination, and error responses.',
  'backend-patterns': 'Guide service structure, server architecture, and backend implementation patterns.',
  'coding-standards': 'Apply general code quality, readability, naming, and maintainability standards.',
  'database-migrations': 'Plan and validate schema changes, migrations, and rollback-safe database updates.',
  'deployment-patterns': 'Handle deployment setup, CI/CD, rollout strategy, and production readiness checks.',
  'django-patterns': 'Use Django architecture, ORM, and app organization patterns.',
  'django-security': 'Review Django-specific authentication, authorization, and security risks.',
  'django-verification': 'Run Django-focused verification steps such as tests, checks, and release readiness.',
  'docker-patterns': 'Work with Docker images, Compose, containerized development, and runtime concerns.',
  'documentation-lookup': 'Pull in up-to-date framework and library docs when implementation details matter.',
  'e2e-testing': 'Cover browser flows and end-to-end behavior with Playwright-style testing patterns.',
  'frontend-patterns': 'Guide component structure, UI architecture, and frontend implementation patterns.',
  'golang-patterns': 'Use idiomatic Go structure, error handling, and package organization.',
  'golang-testing': 'Add or improve Go unit tests, table-driven tests, and coverage.',
  'java-coding-standards': 'Apply Java naming, structure, and maintainability conventions.',
  'laravel-patterns': 'Use Laravel architecture, routing, service, and Eloquent patterns.',
  'laravel-security': 'Review Laravel-specific auth, validation, and security concerns.',
  'laravel-verification': 'Run Laravel-oriented verification steps before merge or release.',
  'mcp-server-patterns': 'Design MCP servers, tools, resources, and validation flows.',
  'nextjs-turbopack': 'Handle Next.js app structure, routing, and Turbopack-specific workflows.',
  'python-patterns': 'Use idiomatic Python structure, typing, and application patterns.',
  'python-testing': 'Add or improve pytest-based tests, fixtures, and regression coverage.',
  'rust-patterns': 'Use idiomatic Rust module design, ownership, and error handling patterns.',
  'rust-testing': 'Add or improve Rust unit, integration, and async testing coverage.',
  'security-review': 'Check auth, input handling, secrets, and common security failure modes.',
  'springboot-patterns': 'Use Spring Boot layering, service design, and backend conventions.',
  'springboot-security': 'Review Spring Security, auth flows, and backend security risks.',
  'springboot-verification': 'Run Spring Boot build, test, and release-readiness checks.',
  'swiftui-patterns': 'Guide SwiftUI structure, state, navigation, and modern app patterns.',
  'tdd-workflow': 'Work test-first or test-close, adding focused coverage around the task at hand.',
  'verification-loop': 'Verify changes with tests, checks, and a final quality pass before wrapping up.',
};

function parseArgs(argv) {
  const options = {
    projectDir: process.cwd(),
    format: 'markdown',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--project') {
      options.projectDir = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === '--format') {
      options.format = argv[index + 1];
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
Usage: node scripts/recommend-skills.js [options]

Options:
  --project <dir>      Repository to analyze (default: current working directory)
  --format <name>      markdown or json
  --help, -h           Show this help text
`);
}

function fileExists(projectDir, relativePath) {
  return fs.existsSync(path.join(projectDir, relativePath));
}

function getPackageNames(projectDir) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];
  } catch {
    return [];
  }
}

function detectProject(projectDir) {
  const packageNames = getPackageNames(projectDir);
  const languages = [];
  const frameworks = [];

  for (const rule of LANGUAGE_RULES) {
    if (rule.markers.some(marker => fileExists(projectDir, marker))) {
      languages.push(rule.language);
    }
  }

  for (const rule of FRAMEWORK_RULES) {
    const hasMarker = rule.markers.some(marker => fileExists(projectDir, marker));
    const hasPackageHint = Array.isArray(rule.packageHints)
      ? rule.packageHints.some(hint => packageNames.some(pkg => pkg.includes(hint)))
      : false;
    if (hasMarker || hasPackageHint) {
      frameworks.push(rule.framework);
    }
  }

  return {
    languages: [...new Set(languages)],
    frameworks: [...new Set(frameworks)],
    packageNames,
  };
}

function describeSkill(skillName) {
  return SKILL_DESCRIPTIONS[skillName] || `Use ${skillName} when it is clearly relevant to the current task.`;
}

function buildRecommendedSkills(alwaysOn, taskSpecific) {
  return [
    ...alwaysOn.map(skill => ({
      name: skill,
      category: 'always-on',
      description: describeSkill(skill),
    })),
    ...taskSpecific.map(skill => ({
      name: skill,
      category: 'task-specific',
      description: describeSkill(skill),
    })),
  ];
}

function recommendSkills(projectDir) {
  const detected = detectProject(projectDir);
  const alwaysOn = new Set(ALWAYS_ON);
  const taskSpecific = new Set();

  for (const rule of LANGUAGE_RULES) {
    if (detected.languages.includes(rule.language)) {
      for (const skill of rule.skills) {
        taskSpecific.add(skill);
      }
    }
  }

  for (const rule of FRAMEWORK_RULES) {
    if (detected.frameworks.includes(rule.framework)) {
      for (const skill of rule.skills) {
        taskSpecific.add(skill);
      }
    }
  }

  if (fileExists(projectDir, 'prisma/schema.prisma') || fileExists(projectDir, 'drizzle.config.ts')) {
    taskSpecific.add('database-migrations');
    taskSpecific.add('api-design');
  }

  if (fileExists(projectDir, 'Dockerfile')) {
    taskSpecific.add('docker-patterns');
    taskSpecific.add('deployment-patterns');
  }

  if (fileExists(projectDir, '.github/workflows')) {
    taskSpecific.add('deployment-patterns');
  }

  const alwaysOnList = [...alwaysOn].sort();
  const taskSpecificList = [...taskSpecific].filter(skill => !alwaysOn.has(skill)).sort();

  return {
    projectDir,
    detected,
    alwaysOn: alwaysOnList,
    taskSpecific: taskSpecificList,
    optInOnly: OPT_IN_ONLY.slice(),
    recommendedSkills: buildRecommendedSkills(alwaysOnList, taskSpecificList),
    activationPrompt: 'Reply to confirm activation if you want to use these recommended skills for the next steps.',
  };
}

function toMarkdown(report) {
  const stack = [
    ...report.detected.languages.map(value => `language:${value}`),
    ...report.detected.frameworks.map(value => `framework:${value}`),
  ];

  return [
    '## Skill Routing',
    '',
    `Project: ${report.projectDir}`,
    `Detected stack: ${stack.length > 0 ? stack.join(', ') : 'unknown'}`,
    '',
    'Recommended skills:',
    ...(report.recommendedSkills.length > 0
      ? report.recommendedSkills.map(skill => `- ${skill.name} (${skill.category}): ${skill.description}`)
      : ['- none']),
    '',
    'Always-on skills:',
    ...report.alwaysOn.map(skill => `- ${skill}`),
    '',
    'Task-specific skills:',
    ...(report.taskSpecific.length > 0 ? report.taskSpecific.map(skill => `- ${skill}`) : ['- none']),
    '',
    'Opt-in only:',
    ...report.optInOnly.map(skill => `- ${skill}`),
    '',
    'Activation:',
    `- ${report.activationPrompt}`,
    '',
  ].join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const report = recommendSkills(options.projectDir);
  if (options.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(toMarkdown(report));
}

if (require.main === module) {
  main();
}

module.exports = {
  detectProject,
  describeSkill,
  recommendSkills,
  toMarkdown,
};
