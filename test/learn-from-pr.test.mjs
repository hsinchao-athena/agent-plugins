import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';

const root = new URL('..', import.meta.url);
const pathFromRoot = (path) => join(root.pathname, path);
const readJson = (path) => JSON.parse(readFileSync(pathFromRoot(path), 'utf8'));

const skillDirectory = 'skills/learn-from-pr';
const schema = readJson(`${skillDirectory}/references/learner-profile.schema.json`);
const defaultProfile = readJson(`${skillDirectory}/references/learner-profile.default.json`);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

function leafPaths(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child) && child.const === undefined
      ? leafPaths(child, path)
      : [path];
  });
}

function schemaLeafPaths(node, prefix = '') {
  return Object.entries(node.properties).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child.type === 'object' ? schemaLeafPaths(child, path) : [path];
  });
}

test('ships the learner profile files and the report theme', () => {
  for (const file of [
    'SKILL.md',
    'references/learner-profile.schema.json',
    'references/learner-profile.default.json',
    'references/report-structure.md',
    'references/report-theme.css',
  ]) {
    assert.ok(existsSync(pathFromRoot(`${skillDirectory}/${file}`)), `${file} must exist`);
  }
});

test('validates the default learner profile against the schema', () => {
  assert.equal(validate(defaultProfile), true, ajv.errorsText(validate.errors));
});

test('sets every field of the schema in the default learner profile', () => {
  assert.deepEqual(
    leafPaths(defaultProfile).sort(),
    schemaLeafPaths(schema).sort(),
  );
});

test('accepts a partial profile as an override and rejects an unknown field', () => {
  assert.equal(validate({ communication: { format_priority: ['table', 'prose'] } }), true);
  assert.equal(validate({ structure: { sections: ['why', 'takeaways'] } }), true);
  assert.equal(validate({ structure: { sections: ['why', 'quiz'] } }), false);
  assert.equal(validate({ architecture: { max_nodes: 100 } }), false);
  assert.equal(validate({ unknown_field: true }), false);
});

test('puts the diagram before the change map in the default section order', () => {
  const { sections } = defaultProfile.structure;
  assert.ok(sections.indexOf('architecture') < sections.indexOf('change_map'));
  assert.ok(sections.indexOf('why') < sections.indexOf('architecture'));
});

test('keeps the report theme identical to the quiz-me theme', () => {
  const quizMe = readFileSync(pathFromRoot('skills/quiz-me/SKILL.md'), 'utf8');
  const quizMeTheme = quizMe.match(/```css\n([\s\S]*?)\n```/)[1];
  const theme = readFileSync(pathFromRoot(`${skillDirectory}/references/report-theme.css`), 'utf8');
  assert.equal(theme.trim(), quizMeTheme.trim());
});

test('documents profile layers, merge rules, and the learning-only scope', () => {
  const skill = readFileSync(pathFromRoot(`${skillDirectory}/SKILL.md`), 'utf8');

  assert.match(skill, /~\/\.config\/learn-from-pr\/profile\.json/);
  assert.match(skill, /Merge objects deeply/);
  assert.match(skill, /Replace an array/);
  assert.match(skill, /learner-profile\.schema\.json/);
  assert.match(skill, /Do not quiz the user, give a merge verdict, post to GitHub, or write a learning log/);
  assert.match(skill, /Never draw an SVG by hand/);
});

test('documents the diagram, the change map, and a viewable-diagram fallback', () => {
  const structure = readFileSync(pathFromRoot(`${skillDirectory}/references/report-structure.md`), 'utf8');

  assert.match(structure, /flowchart LR/);
  assert.match(structure, /accTitle:/);
  assert.match(structure, /touched/);
  assert.match(structure, /Every changed file in the diff must appear in exactly one row/);
  assert.match(structure, /Centralized/);
  assert.match(structure, /Scattered/);
  assert.match(structure, /mmdc/);
  assert.match(structure, /mermaid@11\.4\.1/);
  assert.match(structure, /Never draw the SVG by hand/);
});
