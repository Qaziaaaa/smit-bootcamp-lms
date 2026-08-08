# Team PR Guide (Quick Reference)

Short guide for every member: get the latest code, make your changes, and open a Pull Request that the lead can merge into `dev` with **zero conflicts**.

Replace `<your-name>/<feature>` with your own, e.g. `hakimullah/auth-api`.

---

## 1. Get the latest code from `dev`

Always start from a clean copy of the latest `dev`.

```bash
git checkout dev
git pull origin dev
```

> Do this at the start of every session. If `git pull` says "your branch is up to date", you're on the latest code.

## 2. Create your own branch from it

```bash
git checkout -b <your-name>/<feature>
```

Your branch is now an exact copy of the latest `dev` + only your changes will be added on top.

## 3. Make your changes and commit

```bash
git add .                      # or: git add <specific files>
git commit -m "feat(auth): add login API"
```

## 4. Before pushing — pull latest `dev` once more (keeps it conflict-free)

If `dev` moved while you were working, replay your commits on top of it:

```bash
git pull --rebase origin dev
```

- If there are no conflicts: done, continue.
- If conflicts appear: you resolve them **now**, on your machine (open the files marked `<<<<<<<`, keep your change, `git add` + `git rebase --continue`). The lead should never see conflicts after this step.

## 5. Push your branch

```bash
git push -u origin <your-name>/<feature>
```

## 6. Open the Pull Request with base = `dev` (the most important step)

**Option A — GitHub website:**
1. On GitHub you'll see a yellow bar: "Compare & pull request" → click it.
2. At the top of the PR page check the **base** dropdown — GitHub will auto-select `main`. **You MUST change it to `dev`.**
3. Verify the header reads: `base: dev` ← `<your-name>/<feature>` (and **never** `main`).
4. Add a title + short description, then "Create pull request".

**Option B — Command line (recommended, base `dev` is set for you):**
```bash
gh pr create --base dev --head <your-name>/<feature> --title "feat: describe change" --body "What changed + how to test"
```

Then just leave the PR for the lead to review and merge.

---

## Before you open a PR — checklist

- [ ] Ran `git pull --rebase origin dev` and resolved any conflicts locally
- [ ] PR base is `dev`, not `main`
- [ ] Title is clear, e.g. `feat(auth): add JWT login`
- [ ] Tested it locally (`npm run dev` for frontend, `npm run dev` for backend)

## When the lead merges

You do **not** need to do anything to close the PR. Before starting your **next** task, repeat step 1 to pull the merged code.

---

## Rules to remember

- Never push directly to `dev` or `main`.
- Never open a PR with base `main` — always `dev`.
- Pull latest `dev` before starting AND before pushing.
- The lead reviews and merges every PR.
