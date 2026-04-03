const { spawnSync } = require('node:child_process');

const orderedSpecs = [
  'tests/1-dashboard.spec.ts',
  'tests/2-navigation.spec.ts',
  'tests/3-sprints.spec.ts',
  'tests/4-board.spec.ts',
  'tests/5-issues.spec.ts',
  'tests/6-standup.spec.ts',
  'tests/7-feedback.spec.ts',
  'tests/8-milestones.spec.ts',
  'tests/9-users.spec.ts',
  'tests/10-admin.spec.ts',
  'tests/11-logout.spec.ts',
];

const passthroughArgs = process.argv.slice(2);
let hasFailure = false;

for (const spec of orderedSpecs) {
  console.log(`\n=== Running ${spec} ===`);
  const result = spawnSync(
    'npx',
    ['playwright', 'test', spec, ...passthroughArgs],
    { stdio: 'inherit', shell: true }
  );

  if (result.status !== 0) {
    hasFailure = true;
    console.log(`=== Failed: ${spec} ===`);
  }
}

process.exit(hasFailure ? 1 : 0);
