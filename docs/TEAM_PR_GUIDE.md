# Team PR Guide (Simple Workflow)

Use your **existing branch** (e.g. `feat/hakimullah`). Run these every time you finish work:

```bash
git checkout dev
git pull origin dev                      # get latest code
git checkout <your-branch>               # back to your branch
git pull --rebase origin dev             # put your work on top of latest dev (no conflicts)
git add .
git commit -m "feat: describe your change"
git push origin <your-branch>
```

Then open the PR:

```bash
gh pr create --base dev --head <your-branch> --title "feat: describe your change"
```

**IMPORTANT:** PR base must be `dev`, never `main`. On the GitHub website, change the base dropdown from `main` to `dev` before creating the PR.

If the `--rebase` step shows conflicts, fix them now (files marked `<<<<<<<`), then `git add .` and `git rebase --continue`, then push. Leave the PR for the lead to review and merge.
