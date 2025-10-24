# GitHub Actions Workflows

This directory contains CI/CD automation workflows for The Next 5 Minutes app.

## Workflows

### 1. CI Pipeline (`ci.yml`)
**Trigger**: Push to `main`/`develop`, Pull Requests

**Jobs**:
1. **Lint & Type Check** - ESLint + TypeScript validation
2. **Unit Tests** - Jest tests for recommendation algorithm (45 tests)
3. **Integration Tests** - API route tests with mocked services (37 tests)
4. **E2E Tests** - Playwright browser tests (21 tests)
5. **Build** - Production build verification
6. **All Checks Passed** - Final gate ensuring all jobs succeeded

**Parallelization**: Jobs run in parallel where possible, with `build` depending on core test jobs.

**Coverage**: Uploads to Codecov for unit and integration tests.

### 2. Dependency Review (`dependency-review.yml`)
**Trigger**: Pull Requests only

**Purpose**: Automatically reviews dependency changes for security vulnerabilities.

**Action**: Fails on `moderate` severity or higher, comments summary in PR.

### 3. CodeQL Security Scan (`codeql.yml`)
**Trigger**: 
- Push to `main`/`develop`
- Pull Requests
- Weekly schedule (Mondays 6 AM UTC)

**Purpose**: Static analysis security testing (SAST) for JavaScript/TypeScript.

**Queries**: `security-extended` + `security-and-quality`

## Required GitHub Secrets

Configure these in **Settings > Secrets and variables > Actions**:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`

### Sentry (optional)
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

### Codecov (optional)
- `CODECOV_TOKEN` - Get from https://codecov.io

### Vercel (for preview deployments - optional)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## CI/CD Features

### ✅ Automated Testing
- **96 total tests** across unit, integration, and E2E
- Parallel test execution for speed
- Coverage reporting to Codecov

### 🔒 Security Scanning
- Dependency vulnerability checking
- CodeQL static analysis
- Weekly automated scans

### 🚀 Build Verification
- Production build on every PR/push
- TypeScript type checking
- ESLint enforcement

### 📊 PR Integration
- Status checks required before merge
- Coverage reports in comments
- Dependency review summaries
- Playwright test reports as artifacts

## Local Testing

Run the same checks locally before pushing:

```bash
# Lint and type check
npm run lint
npm run type-check

# Run all tests
npm test                # Unit + Integration
npm run test:e2e        # E2E tests

# Production build
npm run build
```

## Troubleshooting

### Tests failing in CI but passing locally
- Check Node version (CI uses Node 20)
- Verify environment variables are set in GitHub Secrets
- Check for timezone-dependent tests
- Review Playwright report artifact

### Build failing
- Ensure all secrets are configured
- Check Sentry auth token is valid
- Verify Next.js build cache isn't corrupted

### CodeQL taking too long
- CodeQL runs weekly, not on every push
- Analysis typically takes 5-10 minutes
- Check GitHub Actions usage limits

## Performance Optimizations

1. **Concurrency**: Cancels in-progress runs for same PR/branch
2. **Caching**: npm dependencies cached via `actions/setup-node`
3. **Parallelization**: Independent jobs run simultaneously
4. **Artifact Retention**: Playwright reports kept for 7 days only

## Future Enhancements

- [ ] Automated deployment to staging
- [ ] Performance regression testing
- [ ] Visual regression testing with Percy
- [ ] Lighthouse CI for performance budgets
- [ ] Automated changelog generation
