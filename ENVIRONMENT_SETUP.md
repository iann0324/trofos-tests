# Playwright Testing Setup Guide

## Environment Variables Setup

Your tests now use environment variables for credentials, which means:
- ✅ **NO hardcoded passwords** in your code
- ✅ **Credentials never get committed** to git
- ✅ **Easy to manage** across different environments

## How to Set Up

### Step 1: Create your `.env` file

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

### Step 2: Add your credentials

Open `.env` and fill in your actual credentials:

```
TEST_EMAIL=your-email@u.nus.edu
TEST_PASSWORD=your-password-here
```

### Step 3: Run your tests

Tests will automatically load the environment variables:

```bash
npm test
# or
npx playwright test
```

## Important Security Notes

⚠️ **NEVER commit `.env` file to git!**
- The `.gitignore` already protects `.env`, but double-check before committing
- `.env.example` is safe to commit (it has placeholder values)

## How It Works

1. **playwright.config.ts** loads `dotenv` when tests start
2. `dotenv` reads the `.env` file
3. Tests access credentials via `process.env.TEST_EMAIL` and `process.env.TEST_PASSWORD`
4. The auth helper automatically uses these variables

## For CI/CD Environments (GitHub Actions, etc.)

Don't create a `.env` file in CI. Instead, set environment variables directly:

**GitHub Actions Example:**
```yaml
env:
  TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
  TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

**Local Testing:**
```bash
# Windows PowerShell
$env:TEST_EMAIL="your-email@u.nus.edu"
$env:TEST_PASSWORD="your-password"
npm test

# Linux/Mac bash
export TEST_EMAIL="your-email@u.nus.edu"
export TEST_PASSWORD="your-password"
npm test
```

## Troubleshooting

**Error: "Cannot find name 'process'"**
- This is just a TypeScript config warning and won't affect test execution
- Tests will still work fine!

**Tests fail to authenticate**
- Check that `.env` file exists in the project root
- Verify `TEST_EMAIL` and `TEST_PASSWORD` are correct
- Make sure they're on separate lines with `=` sign
