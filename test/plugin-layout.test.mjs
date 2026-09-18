import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const pathFromRoot = (path) => join(root.pathname, path);

function assertAgentSkill(skillPath, skillName) {
  const skill = readFileSync(skillPath, 'utf8');
  const frontmatter = skill.match(
    /^---\r?\nname: ([^\r\n]+)\r?\ndescription: ([^\r\n]+)\r?\n---\r?\n/,
  );

  assert.ok(frontmatter, `${skillPath} must begin with YAML frontmatter`);
  const [, name, description] = frontmatter;
  assert.equal(name, skillName);
  assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(description.trim().length > 0);
  assert.ok(description.length <= 1024);
  assert.ok(skill.slice(frontmatter[0].length).trim().length > 0);
  assert.doesNotMatch(skill, /sapcex-simplify/);
  return skill;
}

test('declares the expected Agent Plugin manifest', () => {
  const manifest = JSON.parse(readFileSync(pathFromRoot('plugin.json'), 'utf8'));

  assert.deepEqual(manifest, {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name: 'olala7846-agent-plugins',
    version: '0.4.0',
    description: 'A collection of agent skills maintained by olala7846.',
    author: {
      name: 'Hsin-Cheng Chao',
      email: 'olala7846@gmail.com',
      url: 'https://github.com/olala7846',
    },
    homepage: 'https://github.com/olala7846/agent-plugins',
    repository: 'https://github.com/olala7846/agent-plugins',
    license: 'ISC',
    keywords: ['agent-plugin', 'agent-skills', 'software-engineering'],
    extensions: {},
  });
});

test('contains only immediately discoverable, complete skills', () => {
  const skillsRoot = pathFromRoot('skills');
  const entries = readdirSync(skillsRoot, { withFileTypes: true });

  const skillNames = ['post-pr-pop-quiz', 'quiz-me', 'repo-init', 'spacex-simplify'];
  assert.deepEqual(entries.map((entry) => entry.name).sort(), skillNames);
  assert.ok(entries.every((entry) => entry.isDirectory()));

  for (const skillName of skillNames) {
    assert.ok(existsSync(join(skillsRoot, skillName, 'SKILL.md')));
    assertAgentSkill(join(skillsRoot, skillName, 'SKILL.md'), skillName);
  }
});

test('documents supported user-scoped guidance destinations', () => {
  const repoInit = readFileSync(
    pathFromRoot('skills/repo-init/SKILL.md'),
    'utf8',
  );

  for (const destination of [
    '$CODEX_HOME/AGENTS.md',
    'Cursor Settings > Rules > User Rules',
    '~/.config/opencode/AGENTS.md',
    '~/.claude/CLAUDE.md',
  ]) {
    assert.ok(repoInit.includes(destination));
  }
});

test('renders quiz diagrams from Mermaid without shipping a Mermaid runtime', () => {
  const quizMe = readFileSync(pathFromRoot('skills/quiz-me/SKILL.md'), 'utf8');

  assert.match(quizMe, /write the diagram in Mermaid first/);
  assert.match(quizMe, /Mermaid `accTitle` and `accDescr` directives/);
  assert.match(quizMe, /local Mermaid-compatible renderer/);
  assert.match(quizMe, /transparent background/);
  assert.match(quizMe, /as a `<title>` and `<desc>`/);
  assert.match(quizMe, /add the title, description, unique IDs, `aria-labelledby`, `aria-describedby`, and `role="img"` during post-processing/);
  assert.match(quizMe, /Normalize the generated SVG styles to match the report's light and dark media-query colors/);
  assert.match(quizMe, /remove generated animation rules while preserving the static diagram/);
  assert.match(quizMe, /final report must contain only the generated SVG/);
  assert.match(quizMe, /Do not include Mermaid source, a Mermaid runtime, JavaScript, remote assets, or a rendering service/);
  assert.match(quizMe, /omit the diagram rather than substituting a hand-drawn SVG/);
});

test('uses package metadata only for development validation tools', () => {
  const packageMetadata = JSON.parse(readFileSync(pathFromRoot('package.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(pathFromRoot('plugin.json'), 'utf8'));

  assert.equal(packageMetadata.private, true);
  assert.equal(packageMetadata.version, manifest.version);
  assert.equal(packageMetadata.bin, undefined);
  assert.equal(packageMetadata.dependencies, undefined);
  assert.deepEqual(packageMetadata.devDependencies, {
    ajv: '8.20.0',
    'skills-ref': '0.1.5',
  });
});

test('does not retain the legacy installer or an MCP component', () => {
  for (const path of [
    'src',
    'tsconfig.json',
    'eslint.config.js',
    '.lintstagedrc',
    '.husky/pre-commit',
    'com.openai.codex',
    'mcp.json',
    'cli-usage.png',
  ]) {
    assert.equal(existsSync(pathFromRoot(path)), false, `${path} must be absent`);
  }
});
