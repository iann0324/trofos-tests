# Trofos Playwright Tests

## Team Run Commands

Use these commands so everyone runs tests the same way:

```bash
# 1) Main stable suite (68 tests, excludes logout) with browser UI
npm run test:all -- --headed

# 2) Logout test only
npm run test:logout

# 3) Full suite including logout (69 tests)
npm run test:all:with-logout

# 4) Quick list of what will run
npm run test:all -- --list

# 5) Single file 
npx playwright test tests/4-board.spec.ts --headed
```

