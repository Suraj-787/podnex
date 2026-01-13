# Git Workflow & Conventions

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `development` - Integration branch for features

### Feature Branches
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `chore/task-name` - Maintenance tasks
- `docs/update-name` - Documentation updates

## Workflow

### 1. Starting New Work
```bash
# Update development branch
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/podcast-player
```

### 2. Making Changes
```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(podcast): add audio player component"
```

### 3. Pushing Changes
```bash
# Push feature branch
git push origin feature/podcast-player

# Create pull request to development
```

### 4. Merging
```bash
# After PR approval, merge to development
# Periodically merge development to main for releases
```

## Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
</subject></scope></type>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Scopes
- `api` - Backend API
- `web` - Frontend web app
- `database` - Database changes
- `auth` - Authentication
- `podcast` - Podcast features
- `billing` - Billing/payments
- `worker` - Background jobs
- `ui` - UI components

### Examples
```bash
# New feature
git commit -m "feat(podcast): add download endpoint with signed URLs"

# Bug fix
git commit -m "fix(auth): resolve session expiration issue"

# Breaking change
git commit -m "feat(api)!: change podcast creation endpoint structure

BREAKING CHANGE: podcast creation now requires duration field"

# Multiple changes
git commit -m "chore: update dependencies and fix linting issues

- Update ioredis to 5.9.1
- Fix TypeScript errors in storage service
- Add missing type definitions"
```

## Branch Protection Rules

### For `main` branch:
- Require pull request reviews (1 approver)
- Require status checks to pass
- Require branches to be up to date
- No direct pushes

### For `development` branch:
- Require pull request reviews (optional for solo dev)
- Require status checks to pass
- Allow direct pushes for solo development

## Pull Request Guidelines

### Title
Use conventional commit format:
```
feat(podcast): add audio player component
```

### Description Template
```markdown
## What does this PR do?
Brief description of changes

## Type of change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## How has this been tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

## Code Review Checklist

### For Reviewers
- [ ] Code is readable and maintainable
- [ ] No obvious bugs or security issues
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate
- [ ] TypeScript types are correct

## Release Process

### Versioning
Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.0.0` - Initial release
- `1.1.0` - New features (backward compatible)
- `1.0.1` - Bug fixes
- `2.0.0` - Breaking changes

### Creating a Release
```bash
# 1. Merge development to main
git checkout main
git merge development

# 2. Update version in package.json
npm version minor  # or major/patch

# 3. Create git tag
git tag -a v1.1.0 -m "Release v1.1.0"

# 4. Push changes and tags
git push origin main
git push origin --tags

# 5. Deploy to production
```

## Git Hooks (Optional)

### Pre-commit
```bash
# Install husky
pnpm add -D husky

# Initialize
npx husky init

# Add pre-commit hook
echo "pnpm lint-staged" > .husky/pre-commit
```

### Lint-staged
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

## Best Practices

### Do's ✅
- Commit often with meaningful messages
- Keep commits atomic (one logical change)
- Write descriptive commit messages
- Review your own code before pushing
- Keep branches up to date
- Delete merged branches

### Don'ts ❌
- Don't commit directly to main
- Don't commit sensitive data (.env files)
- Don't use vague commit messages ("fix stuff")
- Don't commit commented-out code
- Don't commit console.logs (use proper logging)
- Don't mix unrelated changes in one commit

## Troubleshooting

### Undo last commit (not pushed)
```bash
git reset --soft HEAD~1
```

### Undo last commit (already pushed)
```bash
git revert HEAD
git push
```

### Resolve merge conflicts
```bash
# 1. Pull latest changes
git pull origin development

# 2. Resolve conflicts in files
# 3. Stage resolved files
git add .

# 4. Complete merge
git commit
```

### Clean up local branches
```bash
# Delete merged branches
git branch --merged | grep -v "main\|development" | xargs git branch -d

# Delete remote tracking branches
git fetch --prune
```
