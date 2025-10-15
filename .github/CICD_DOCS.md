# CI/CD Workflows Documentation

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment. The workflows ensure code quality and cross-browser compatibility across multiple platforms.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master`, `main`, or `develop` branches
- Manual workflow dispatch

**Jobs:**

#### Lint Job
- Runs ESLint to check code quality
- Ensures consistent code style
- Reports any linting errors

#### Browser-Specific Test Jobs
- **Chrome Tests**: Tests extension on Chrome/Chromium
- **Firefox Tests**: Tests extension on Firefox
- **Edge Tests**: Tests extension on Edge

Each test job:
- Checks out the code
- Sets up Node.js 18
- Installs dependencies
- Runs browser-specific tests
- Uploads test results as artifacts

#### Cross-Browser Tests Job
- Runs comprehensive tests across all browsers
- Validates compatibility
- Generates test reports

#### Validation Job
- Runs after all other jobs complete
- Performs full validation with `npm run dev`
- Builds the extension
- Ensures production readiness

### 2. Multi-Browser Test Matrix (`.github/workflows/test-matrix.yml`)

**Triggers:**
- Push to main branches
- Pull requests to main branches
- Daily at 2 AM UTC (scheduled)
- Manual workflow dispatch

**Features:**
- Tests on multiple operating systems:
  - Ubuntu (Linux)
  - Windows
  - macOS
- Tests with multiple Node.js versions (18, 20)
- Tests all browsers (Chrome, Firefox, Edge) where available
- Generates comprehensive test summary
- Uses fail-fast: false to test all combinations

### 3. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- GitHub release creation
- Manual workflow dispatch with version input

**Jobs:**

#### Build and Deploy
1. Runs all tests to ensure quality
2. Runs linter for code quality
3. Builds the extension
4. Creates distribution packages:
   - `chrome-extension.zip` - Chrome/Chromium package
   - `firefox-extension.zip` - Firefox package
5. Uploads artifacts to workflow
6. Attaches packages to GitHub release

## Test Artifacts

All workflows upload test results as artifacts:
- Can be downloaded from workflow run page
- Useful for debugging failed tests
- Retained for analysis

## Status Badges

The README includes badges showing workflow status:
- [![CI](https://github.com/shawal-mbalire/music-removal-extension/workflows/CI/badge.svg)](https://github.com/shawal-mbalire/music-removal-extension/actions/workflows/ci.yml)
- [![Multi-Browser Tests](https://github.com/shawal-mbalire/music-removal-extension/workflows/Multi-Browser%20Test%20Matrix/badge.svg)](https://github.com/shawal-mbalire/music-removal-extension/actions/workflows/test-matrix.yml)
- [![Release](https://github.com/shawal-mbalire/music-removal-extension/workflows/Release/badge.svg)](https://github.com/shawal-mbalire/music-removal-extension/actions/workflows/release.yml)

## Running Tests Locally

### All Tests
```bash
npm test                    # Run standard test suite
npm run test:all-browsers   # Run all browser tests
npm run test:chrome         # Test Chrome specifically
npm run test:firefox        # Test Firefox specifically
npm run test:edge           # Test Edge specifically
npm run lint                # Run linter
npm run dev                 # Run tests + linter
```

### CI Script
The CI workflow can be replicated locally:
```bash
npm ci                      # Install exact dependencies
npm run lint                # Check code quality
npm run test:all-browsers   # Run all tests
npm run build               # Build extension
```

## Branch Protection

For optimal CI/CD integration, configure branch protection rules:

1. Require status checks to pass before merging
2. Require pull request reviews
3. Enable the following required checks:
   - Lint Code
   - Test on Chrome
   - Test on Firefox
   - Test on Edge
   - Full Validation

## Deployment Process

### Manual Release
1. Update version in `manifest.json` and `package.json`
2. Commit changes
3. Create a new release on GitHub
4. Release workflow automatically:
   - Runs all tests
   - Builds packages
   - Uploads to release

### Automated Release
1. Trigger the release workflow manually
2. Provide version number
3. Workflow handles everything

## Troubleshooting

### Failed Tests
1. Check workflow logs in GitHub Actions
2. Download test artifacts for details
3. Run tests locally to reproduce
4. Fix issues and push changes

### Failed Builds
1. Verify all files are committed
2. Check manifest.json syntax
3. Ensure icons exist
4. Test build locally with `npm run build`

## Future Enhancements

Potential improvements:
- [ ] Add code coverage reporting
- [ ] Integrate browser automation for E2E tests
- [ ] Add performance benchmarking
- [ ] Implement automatic version bumping
- [ ] Add security scanning
- [ ] Deploy to Chrome Web Store automatically
- [ ] Deploy to Firefox Add-ons automatically
