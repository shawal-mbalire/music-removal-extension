# GitHub Actions Workflows

This directory contains CI/CD workflows for the Universal Music Removal Extension.

## Available Workflows

### ✅ ci.yml - Continuous Integration
**Status:** Active  
**Purpose:** Runs on every push and PR to ensure code quality and browser compatibility

**Jobs:**
- Lint code with ESLint
- Test on Chrome
- Test on Firefox  
- Test on Edge
- Cross-browser validation
- Full extension build

### ✅ test-matrix.yml - Multi-Browser Test Matrix
**Status:** Active  
**Purpose:** Comprehensive testing across multiple OS and Node versions

**Matrix:**
- OS: Ubuntu, Windows, macOS
- Browsers: Chrome, Firefox, Edge
- Node versions: 18, 20
- Runs daily at 2 AM UTC

### ✅ release.yml - Release Automation
**Status:** Active  
**Purpose:** Automate extension packaging and deployment

**Artifacts:**
- Chrome extension package (.zip)
- Firefox extension package (.zip)
- Automatic upload to GitHub releases

## Workflow Triggers

| Workflow | Push | PR | Release | Schedule | Manual |
|----------|------|----|---------| ---------|--------|
| CI | ✅ | ✅ | ❌ | ❌ | ✅ |
| Test Matrix | ✅ | ✅ | ❌ | ✅ (daily) | ✅ |
| Release | ❌ | ❌ | ✅ | ❌ | ✅ |

## Required Secrets

Currently, no secrets are required for the workflows. The release workflow uses the default `GITHUB_TOKEN` for uploading assets.

## Badge URLs

Add these to your README:

```markdown
[![CI](https://github.com/shawal-mbalire/music-removal-extension/workflows/CI/badge.svg)](https://github.com/shawal-mbalire/music-removal-extension/actions/workflows/ci.yml)
[![Multi-Browser Tests](https://github.com/shawal-mbalire/music-removal-extension/workflows/Multi-Browser%20Test%20Matrix/badge.svg)](https://github.com/shawal-mbalire/music-removal-extension/actions/workflows/test-matrix.yml)
[![Release](https://github.com/shawal-mbalire/music-removal-extension/workflows/Release/badge.svg)](https://github.com/shawal-mbalire/music-removal-extension/actions/workflows/release.yml)
```

## Local Testing

Replicate CI workflow locally:

```bash
# Install dependencies (exact versions)
npm ci

# Run linting
npm run lint

# Run all browser tests
npm run test:all-browsers

# Build extension
npm run build
```

## Adding New Workflows

1. Create a new `.yml` file in this directory
2. Define triggers, jobs, and steps
3. Test locally if possible
4. Commit and push to trigger the workflow
5. Update this README with the new workflow details
