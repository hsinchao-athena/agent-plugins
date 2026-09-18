import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const renderScript = join(repoRoot, 'skills/post-pr-pop-quiz/scripts/render.py');

function writeQuiz(directory, extra = {}) {
  const quizPath = join(directory, 'quiz.json');
  writeFileSync(
    quizPath,
    JSON.stringify({
      pr: {
        number: 19,
        url: 'https://github.com/olala7846/agent-plugins/pull/19',
        summary: 'Add a locked-template browser pop quiz.',
      },
      question: 'Why keep a locked HTML template?',
      options: [
        { text: 'Correct reason.', correct: true, why: 'Style cannot drift.' },
        { text: 'Skip the browser.', correct: false, why: 'The page is the quiz.' },
        { text: 'Let each agent restyle it.', correct: false, why: 'That is the failure mode.' },
        { text: 'Grade from the PR title.', correct: false, why: 'The quiz still teaches the change.' },
      ],
      ...extra,
    }),
  );
  return quizPath;
}

function renderQuiz(quizPath, seed) {
  const env = { ...process.env };
  if (seed === undefined || seed === '') {
    delete env.POST_PR_POP_QUIZ_SHUFFLE_SEED;
  } else {
    env.POST_PR_POP_QUIZ_SHUFFLE_SEED = String(seed);
  }
  const htmlPath = execFileSync(
    'python3',
    [renderScript, '--no-open', quizPath],
    {
      encoding: 'utf8',
      env,
    },
  ).trim();
  const html = readFileSync(htmlPath, 'utf8');
  const match = html.match(
    /<script id="quiz-data" type="application\/json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, 'rendered HTML must embed quiz JSON');
  return { html, quiz: JSON.parse(match[1]) };
}

test('renders a hyperlinked PR header and shuffles answers before assigning letters', () => {
  const directory = mkdtempSync(join(tmpdir(), 'post-pr-pop-quiz-'));

  try {
    const quizPath = writeQuiz(directory);
    const first = renderQuiz(quizPath, 1);
    const second = renderQuiz(quizPath, 2);
    const again = renderQuiz(quizPath, 1);

    assert.match(first.html, /id="pr-link"/);
    assert.match(first.html, /id="pr-summary"/);
    assert.equal(first.quiz.pr.number, 19);
    assert.equal(
      first.quiz.pr.url,
      'https://github.com/olala7846/agent-plugins/pull/19',
    );
    assert.equal(first.quiz.pr.summary, 'Add a locked-template browser pop quiz.');
    assert.deepEqual(
      first.quiz.options.map((option) => option.letter),
      ['A', 'B', 'C', 'D'],
    );
    assert.equal(first.quiz.options.filter((option) => option.correct).length, 1);
    assert.equal(first.quiz.options[0].correct, false);
    assert.equal(second.quiz.options[0].correct, false);
    assert.deepEqual(
      first.quiz.options.map((option) => option.text),
      again.quiz.options.map((option) => option.text),
    );
    assert.notDeepEqual(
      first.quiz.options.map((option) => option.text),
      second.quiz.options.map((option) => option.text),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('PR-number seeds keep the correct option off slot A', () => {
  const directory = mkdtempSync(join(tmpdir(), 'post-pr-pop-quiz-pr-seed-'));

  try {
    const seen = new Set();
    for (const prNumber of [1, 2, 19, 20, 100]) {
      const quizPath = writeQuiz(directory, {
        pr: {
          number: prNumber,
          url: `https://github.com/olala7846/agent-plugins/pull/${prNumber}`,
          summary: 'Add a locked-template browser pop quiz.',
        },
      });
      const rendered = renderQuiz(quizPath, '');
      assert.equal(rendered.quiz.options[0].correct, false, `PR ${prNumber} left correct in A`);
      seen.add(rendered.quiz.options.map((option) => option.text).join('|'));
    }
    assert.ok(seen.size > 1, 'different PR numbers should change option order');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
