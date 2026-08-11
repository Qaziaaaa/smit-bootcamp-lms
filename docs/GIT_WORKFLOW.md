# Git Workflow

## Branch Strategy

```
main  -> trainer-managed (EMPTY, do not touch)
dev   -> integration branch (all team code merges here)
feature/member-branch -> personal working branches
```

- `main` is owned by the trainer. No team member ever pushes to it or opens a PR against it.
- `dev` is the shared integration branch. All approved work lands here.
- Every member works on their own branch, created from `dev`.

## Branch Naming

```
<member-name>/<feature>
```

Examples:

- `abdullah/login`
- `hakimullah/auth-api`

## First Time Setup (once per member)

```bash
git clone https://github.com/SMIT-Bootcamp/Saylani-Bootcamp-LMS3.git
git checkout dev
git checkout -b abdullah/login
```

## Daily Workflow

```bash
# 1. Start a new task
git checkout dev
git pull origin dev            # get latest approved work
git checkout -b <member>/<feature>

# 2. Work, then commit small
git add <files>                # NEVER use `git add .` blindly
git commit -m "feat(auth): add login form"

# 3. Push and open a Pull Request
git push -u origin <member>/<feature>
```

Then on GitHub: **New Pull Request** → **IMPORTANT: set base to `dev`** → compare your branch → Create PR.

> ⚠️ **WARNING:** `main` is the repo's default branch, so GitHub will pre-select **`main`** as the PR base. You MUST change it to `dev` every time, otherwise the PR will be merged into `main` instead of `dev`. Look at the top of the PR page: base should read `dev`, never `main`.

## Pull Request Rules

- Base branch is always `dev`. **Never `main`** — check it on every PR.
- Title describes the change: `feat(module): what it does`.
- Add a short description of what changed and how to test it.
- The team lead reviews and merges. Nobody merges their own PR.
- Resolve merge conflicts locally before re-pushing (see below).

## Staying In Sync (before continuing any work)

```bash
git checkout dev
git pull origin dev
git checkout <member>/<feature>
git merge dev
# resolve conflicts if any, then commit + push
```

Do this at the start of every session and before opening a PR.

## Commit Message Convention

Format: `type(scope): subject`

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change with no behavior change
- `docs` — documentation
- `style` — formatting, no logic change
- `test` — tests
- `chore` — build/tooling

Examples:

```
feat(auth): add JWT login endpoint
fix(attendance): correct percentage rounding
docs: add git workflow
```

One logical change per commit. Keep commits small and reviewable.

## Conflict Handling

1. `git merge dev` from your feature branch.
2. Open the conflicted files (marked with `<<<<<<<`).
3. Decide what to keep — ask the teammate who owns the conflicting code if unsure.
4. Delete the conflict markers, save.
5. `git add <files>` then `git commit`.
6. `git push`.

## Rules Summary

- Never commit to `dev` or `main` directly.
- Always open a PR; lead merges it into `dev`.
- Pull latest `dev` before you start and before you PR.
- Keep commit messages clear and scoped.
